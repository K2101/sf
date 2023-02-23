import { Body, Controller, Post, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SerializerInterceptor } from 'src/interceptors/serialize.interceptor';
import { AppService } from './app.service';
import { CreateUserDto, Role, UserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/gg')
  gg(): string {
    console.log('gg');
    return 'gg';
  }

  // @UseInterceptors(new SerializerInterceptor(UserDto))
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    return await this.appService.signup(
      body.email,
      body.password,
      body.username,
    );
  }
  @Post('/signin')
  async signin(@Body() body: SignInDto) {
    return await this.appService.signin(body.email, body.password);
  }

  // if you see the error like
  // ERROR [ServerKafka] ERROR [Connection] Response Heartbeat(key: 12, version: 3) {"timestamp":"2023-02-21T13:26:56.890Z","logger":"kafkajs","broker":"localhost:9094","clientId"
  // :"nestjs-consumer-server","error":"The group is rebalancing, so a rejoin is needed","correlationId":8,"size":10}
  // please wait for consumer rebalance.
  // any for now

  @EventPattern('USER_CREATED')
  async consumeUserCreation(data: any) {
    await this.appService.consumeUserCreation(data);
  }

  // don't forgot to add admin guard.
  @Post('/admin/signup')
  async createAdmin(@Body() body: CreateUserDto) {
    const role = Role.Admin;
    return await this.appService.signup(
      body.email,
      body.password,
      body.username,
      role,
    );
  }
}
