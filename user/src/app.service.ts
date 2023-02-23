import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
  ) {}

  async getUserInfo(request: any, idParam?: string) {
    const id = idParam || request.user.id;
    return await this.repo.findOne({ where: { id } });
  }

  async consumeUserCreation(data: any) {
    const { id, email, isActive, role, username, createAt } = data;

    const user = this.repo.create({
      id,
      email,
      isActive,
      role,
      username,
      createAt,
    });

    await this.repo.save(user);
    console.log('user create consume success');
  }

  async updateUserInfo(request: any, data: UpdateUserDto) {
    const id = request.user.id;
    const userInfo = await this.getUserInfo(request, id);
    console.log(userInfo);

    if (!userInfo) {
      throw new NotFoundException('user not found');
    }

    const updatedinfo = Object.assign(userInfo, data);

    await this.repo.save(updatedinfo);
    console.log('update info success');
    return 'updated user info success';
  }
}
