import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { Repository } from 'typeorm/repository/Repository';
import { CreateProductDto } from './dto/product-create.dto';
import { UserCreateDto } from './dto/user-create.dto';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';
import { v4 } from 'uuid';
import { UpdateProductDto } from './dto/update-product.dto';
import { OrderCreateDto } from './dto/order-create.dto';
import { In } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @Inject('PRODUCT_KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async consumeUserCreation(data: any) {
    const { id, role } = data;
    const user = this.userRepo.create({ id, role });

    await this.userRepo.save(user);
    console.log('user created');
  }

  async createProduct(product: CreateProductDto) {
    const id: string = v4();

    const createAt = new Date();

    const { title, price, description, amount, tag } = product;
    const productObj = this.productRepo.create({
      id,
      createAt,
      title,
      price,
      description,
      amount,
      tag,
    });

    try {
      // product
      await this.kafka.emit('PRODUCT_CREATED', JSON.stringify(productObj));
    } catch (err) {
      console.log('error to produce product', err);
      throw new InternalServerErrorException('erro to produce product');
    }
    return 'created product';
  }

  async consumeProductCreation(product: any) {
    const { id, createAt, title, price, description, amount, tag } = product;

    const productObj = this.productRepo.create({
      id,
      createAt,
      title,
      price,
      description,
      amount,
      tag,
    });

    await this.productRepo.save(productObj);
    console.log('product inserted');
  }

  async getAllProduct() {
    const produces = await this.productRepo.find();

    return produces;
  }

  async getProduct(id: string) {
    const product = await this.productRepo.findBy({ id });

    return product;
  }

  async upddateProduct(id: string, updateValue: UpdateProductDto) {
    console.log('updateValue', updateValue);
    const product = await this.getProduct(id);

    if (!product.length) {
      throw new NotFoundException('product not found');
    }
    if (product.length > 1) {
      throw new InternalServerErrorException('got uplicate product id');
    }

    console.log('product', product);

    // in amount maybe fetch before update new amount.
    const updatedProduct = Object.assign(product[0], updateValue);
    console.log('updatedProduct', updatedProduct);

    try {
      // produce
      this.kafka.emit('PRODUCT_UPDATED', JSON.stringify(updatedProduct));
    } catch (err) {
      // can be retry
      console.log(err);
      throw new InternalServerErrorException('cannot update product');
    }

    return 'product updated';
  }

  async consumeProductUpdate(product: any) {
    const updatedProduct = this.productRepo.create(product);

    try {
      await this.productRepo.save(updatedProduct);
      console.log('product updated');
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('cannot update product');
    }
  }

  async consumeOrderCreation(data: any) {
    const productAmountMap = {};
    let productIdList = data.productIds;
    if (!data.productIds.length) {
      return;
    }

    for (const ele of data.productIds) {
      if (productAmountMap[ele]) {
        productAmountMap[ele] += 1;
      } else {
        productAmountMap[ele] = 1;
      }
    }

    const products = await this.productRepo.findBy({ id: In(productIdList) });
    if (!products.length) {
      return;
    }

    // need to use highest isolation level because that product can be concurrently access
    // more than one threads (nodejs fork or async context switching by os).
    const result = this.productRepo.manager.transaction(
      'SERIALIZABLE',
      async (tsManager) => {
        for (const ele of products) {
          const newAmount = ele.amount - productAmountMap[ele.id];
          const updatedProduct = Object.assign(ele, { amount: newAmount });
          await this.productRepo.save(updatedProduct);
        }
      },
    );

    // by default kafka are either of at least or at most one policy
    // but we need exactly one, this can achieve by kafka exactly one policy but that come with overhead.
    // and we can use monotonic increment column (like counter += 1 in product table in order service)
    // and compare with product column in this service if message get duplicate then we're ignored.
    // we can also use product id as a key of message for serializable.

    await result;
    // if above transaction failed, the message will lost (this kafkajs client are auto commit),
    // we need retry on this (backoff).
    console.log('updated product amount');
  }
}
