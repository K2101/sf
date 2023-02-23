import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { EventPattern } from '@nestjs/microservices/decorators';
import { AppService } from './app.service';
import { Role, UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('user')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('USER_CREATED')
  async consumeUserCreation(data: any) {
    await this.appService.consumeUserCreation(data);
  }

  @UseGuards(new AuthGuard())
  @Get()
  async getUserInfo(@Req() request: any) {
    return await this.appService.getUserInfo(request);
  }

  @UseGuards(new AuthGuard())
  @Put()
  async updateUserInfo(@Req() request: any, @Body() data: UpdateUserDto) {
    return await this.appService.updateUserInfo(request, data);
  }
}
