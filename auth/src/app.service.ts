import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices/client';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { AuthEntity } from './app.entity';
import { Role } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { sign as _sign } from 'jsonwebtoken';

const scrypt = promisify(_scrypt);
const sign = promisify(_sign);

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(AuthEntity)
    private repo: Repository<AuthEntity>,
  ) {}

  async findEmail(email: string) {
    return await this.repo.findOne({ where: { email } });
  }

  async findUsername(username: string) {
    return await this.repo.findOne({ where: { username } });
  }

  async signup(
    email: string,
    password: string,
    username: string,
    roleParam?: Role,
  ) {
    const id: string = uuidv4();
    const role = roleParam || Role.User;
    const isActive = true;
    const createAt = new Date();

    const isUsed = await this.findEmail(email);

    if (isUsed) {
      throw new BadRequestException('email is already use');
    }

    const isUsernameinUsed = await this.findUsername(username);

    if (isUsernameinUsed) {
      throw new BadRequestException('username is already use');
    }

    const salt = randomBytes(16).toString('hex');
    const hash = await this.hash(password, salt);

    const user = this.repo.create({
      id,
      email,
      password: hash,
      isActive,
      role,
      username,
      createAt,
    });

    try {
      // produce first.
      // we don't even know whether user creation is success or not due to the nature of microservices architecture
      // so uniqueness required consensus and every microservices's database are denormalization,
      // because two of the same username can create concurrently, and the auth that consume themself get boom! 'this username already exist'.
      // but if we insert to db first, then the produce round can failed and end up with this auth service register success,
      // but user service don't have any data for that user due to the producer failed (dual write).
      // even make signup at user servive still get the same problem.
      // one solition would be transaction outbox, but that require a lot of code and framework to watch transaction outbox table.
      await this.kafka.emit('USER_CREATED', JSON.stringify(user));
      console.log('produce success');
      return 'user created';
    } catch (err) {
      throw new InternalServerErrorException('cannot produce to kafka');
    }
  }

  async signin(email: string, password: string) {
    const fetchUser = await this.findEmail(email);
    if (!fetchUser) {
      throw new NotFoundException('user not found');
    }

    const [salt, storeHash] = fetchUser.password.split('.');
    const hash = await this.hash(password, salt);
    if (hash !== fetchUser.password) {
      throw new BadRequestException('email or password are incorrect');
    }

    const expired = fetchUser.role === Role.Admin ? 86400 * 30 : 86400 * 3;
    const jwt = await sign(
      {
        exp: Date.now() + expired,
        data: { id: fetchUser.id, role: fetchUser.role },
      },
      'secret',
    );
    return jwt;
  }

  // {
  //   email: 'auttapon192219@hotmail.com',
  //   password: '027ffad528412a918264666e4f162409.77562b489a58991ec56ea960fa34440108d99ff25e1ec167b3e0087ebd62eb1a',
  //   isActive: true,
  //   role: 'USER',
  //   username: 'use4142r1',
  //   createAt: '2023-02-21T13:31:58.157Z'
  // }
  async consumeUserCreation(data: any) {
    const { id, email, password, isActive, role, username, createAt } = data;
    const user = this.repo.create({
      id,
      email,
      password,
      isActive,
      role,
      username,
      createAt,
    });

    try {
      await this.repo.save(user);
      console.log('insert success');
    } catch (err) {
      // log
      console.log(err);
    }
  }
  async hash(password: string, salt: string) {
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');
    return result;
  }
}
