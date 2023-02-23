import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  Put,
  Body,
  Post,
} from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { OrderCreateDto } from './dto/order-create.dto';
import { OrderUpdateDto, OrderUpdateStatusDto } from './dto/order-update.dto';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { AuthGuard } from './guards/auth.guard';
import { OrderEntity } from './order.entity';
import { Role, UserEntity } from './user.entity';

@Controller('order')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('USER_CREATED')
  async consumeUserCreation(data: any) {
    await this.appService.consumeUserCreation(data);
  }

  @EventPattern('PRODUCT_CREATED')
  async consumeProductCreation(data: any) {
    await this.appService.consumeProductCreation(data);
  }

  @EventPattern('PRODUCT_UPDATED')
  async consumeProductUpdate(data: any) {
    await this.appService.consumeProductUpdate(data);
  }

  @EventPattern('ORDER_CREATED')
  async consumeOrderCreate(data: any) {
    await this.appService.consumeOrderCreate(data);
  }

  @UseGuards(new AuthGuard())
  @Post()
  async orderCreate(@Req() req: any, @Body() order: OrderCreateDto) {
    return await this.appService.orderCreate(req, order);
  }

  @UseGuards(new AuthGuard())
  @Get('/:id')
  async getOrderDetail(@Req() request: any, @Param('id') orderId: string) {
    return await this.appService.getOrderDetail(request, orderId);
  }

  @UseGuards(new AuthGuard(Role.Admin))
  @Get()
  async getAllOrder() {
    return await this.appService.getAllOrder();
  }

  @UseGuards(new AuthGuard())
  @Put('/:id')
  async updateOrder(@Req() req: any, @Body() order: OrderUpdateDto) {
    return await this.appService.updateOrder(req, order);
  }

  @UseGuards(new AuthGuard(Role.Admin))
  @Put('status/:id')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() order: OrderUpdateStatusDto,
  ) {
    return await this.appService.updateOrderStatus(orderId, order);
  }

  async orderPaymentSuccess(objFromPaymentgateway: any) {
    // webhook for payment gateway for calling the order is paying successfuly.
  }
}
