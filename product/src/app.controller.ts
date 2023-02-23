import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { OrderCreateDto } from './dto/order-create.dto';
import { CreateProductDto } from './dto/product-create.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { AuthGuard } from './guards/auth.guard';
import { ProductEntity } from './product.entity';
import { Role, UserEntity } from './user.entity';

@Controller('product')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('USER_CREATED')
  // dto not working in kafka message extract????.
  // will try with interface type later.
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
  async consumeOrderCreation(data: any) {
    await this.appService.consumeOrderCreation(data);
  }

  @Get()
  async getAllProduct() {
    return await this.appService.getAllProduct();
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string) {
    return await this.appService.getProduct(id);
  }

  @UseGuards(new AuthGuard(Role.Admin))
  @Post()
  async createProduct(@Body() body: CreateProductDto) {
    return await this.appService.createProduct(body);
  }

  @UseGuards(new AuthGuard(Role.Admin))
  @Put('/:id')
  async upddateProduct(
    @Param('id') id: string,
    @Body() updateValue: UpdateProductDto,
  ) {
    return await this.appService.upddateProduct(id, updateValue);
  }
}
