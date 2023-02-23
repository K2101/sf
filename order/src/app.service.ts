import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm/dist';
import { In, Repository } from 'typeorm';
import { OrderCreateDto, Status } from './dto/order-create.dto';
import { OrderUpdateDto, OrderUpdateStatusDto } from './dto/order-update.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { OrderEntity } from './order.entity';
import { ProductEntity } from './product.entity';
import { Role, UserEntity } from './user.entity';
import { v4 } from 'uuid';
import { ProductCreateDto } from './dto/product-create.dto';

@Injectable()
export class AppService {
  constructor(
    @Inject('ORDER_KAFKA') private readonly kafka: ClientKafka,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async consumeUserCreation(data: any) {
    const user = this.userRepo.create(data);
    await this.userRepo.save(user);
    console.log('user created');
  }

  async consumeProductCreation(data: any) {
    const product = this.productRepo.create(data);
    await this.productRepo.save(product);
    console.log('product created');
  }

  async consumeProductUpdate(data: any) {
    const product = this.getProduct(data.id);
    if (!product) {
      throw new NotFoundException('product not found');
    }

    const updatedProduct = Object.assign(product, data);

    await this.productRepo.save(updatedProduct);
    console.log('product updated');
  }

  async orderCreate(req: any, order: OrderCreateDto) {
    const orderId = v4();
    const userId = req.user.id;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    console.log('user', user);

    if (!user.isActive) {
      throw new BadRequestException(
        'this user is Inactive mode and cannot ordering the products',
      );
    }

    const totalAmount = order.productsId.length;
    const results = await this.productRepo.find({
      where: { id: In(order.productsId) },
      order: { createAt: 'ASC' },
    });

    if (!results.length) {
      throw new NotFoundException('products not found');
    }

    let productsName = [];
    let totalPrice = 0;

    let numberOfProductAvailable = 0;

    for (const ele of results) {
      productsName.push(ele.title);
      totalPrice += ele.price;
      numberOfProductAvailable += ele.amount;
    }

    // again we don't know for this, maybe some user can concorrently ordering same product.
    if (numberOfProductAvailable < totalAmount) {
      throw new BadRequestException(
        'product are not enough to available (out of stock)',
      );
    }

    const productIds = [];
    const productNames = [];

    for (const ele of results) {
      productIds.push(ele.id);
      productNames.push(ele.title);
    }

    const createAt = new Date();
    const status = Status.Pending;
    const newOrder = this.orderRepo.create({
      orderId,
      userId,
      productIds,
      productNames,
      totalPrice,
      totalAmount,
      createAt,
      status,
    });

    // we don't have partition key for ORDER_CREATED message since it undeterministic, if we use product id or name as a key, it
    // can end up with diffenrent partition as well (like two of two products id concatinate !== one of product id).
    // like this. order1, [123,456] order2, [123] so 123456 !== 123. so order1 still touch product id 123.
    try {
      // product
      this.kafka.emit('ORDER_CREATED', JSON.stringify(newOrder));
    } catch (err) {
      console.log(err);
      return 'cannot place an order';
    }

    // again we don't know the order is success or not, so we still need to process self produce to check that an
    // order is success because we don't know amount of particular product since that product can concurrently ordering.
    // for example if we decrease amount of the order in this endpoint, the data can end up with inconsistency state,
    // (dual write, we can't transaction of decrease amount of product and produce to kafka, except transaction outbox like i said early).
    // we need to produce order first to tell product service that amount of the product is decrease for this ordering.

    // in process of response to user whether their order are success or not, we might use some queue like
    // redis pub-sub or some message queue, but all of that queue internally still poll periodically anyway.
    // the easier solution would be query periodically (like exponential backoff) with that id and isSuccess is true or false
    // and return response to appropriate result.

    console.log('order created');
    // query periodically before returned.
    return 'success to place an order';
  }

  async getProduct(id: string) {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    return product;
  }

  async consumeOrderCreate(order: any) {
    const productAmontMap = {};
    const productIdlist = order.productIds;
    const productNames = order.productNames;
    for (const ele of order.productIds) {
      if (productAmontMap[ele]) {
        productAmontMap[ele] += 1;
      } else {
        productAmontMap[ele] = 1;
      }
    }

    // console.log('order', order);
    // order {
    //   orderId: '5a0d65fc-8fea-4822-8a2f-b3ccf9fd5608',
    //   userId: '010d64e9-da1e-4cc7-b27f-8f947fcce7a9',
    //   productIds: [ '92ca5027-8630-4205-9e05-e2a3d09cf766', 'title1' ],
    //   productNames: [],
    //   totalPrice: '010.5',
    //   totalAmount: 1,
    //   createAt: '2023-02-23T07:38:34.854Z',
    //   status: 'PENDING'
    // }

    const totalPriceStr = String(order.totalPrice);
    const totalPrice = parseFloat(totalPriceStr);
    const newOrder = this.orderRepo.create({
      orderId: order.orderId,
      userId: order.userId,
      productIds: productIdlist,
      productNames: productNames,
      totalPrice,
      totalAmount: order.totalAmount,
      createAt: order.createAt,
      status: order.status,
    });

    const transactionResult = this.orderRepo.manager.transaction(
      'SERIALIZABLE',
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(newOrder);

        const products = await this.productRepo.find({
          where: { id: In(productIdlist) },
          order: { createAt: 'ASC' },
        });

        for (const ele of products) {
          const amount = ele.amount - productAmontMap[ele.id];
          const updatedProduct = Object.assign(ele, { amount });
          await this.productRepo.save(updatedProduct);
        }
      },
    );

    await transactionResult;
    console.log('committed');
  }

  async getOrderDetail(req: any, orderId: string) {
    const order = await this.orderRepo.findOneBy({ orderId });

    if (!order) {
      return new NotFoundException('order not found');
    }

    if (req.user.role !== Role.Admin) {
      if (order.userId !== req.user.id) {
        // return new ForbiddenException('order not found');
        return new NotFoundException('order not found');
      }
    }

    return order;
  }

  async getAllOrder() {
    const orders = await this.orderRepo.find();
    return orders;
  }

  async updateOrder(req: any, order: OrderUpdateDto) {
    const fetchOrder = this.getOrderDetail(req, order.orderId);
    if (!fetchOrder) {
      return new NotFoundException('order not found');
    }

    const updatedOrder = Object.assign(fetchOrder, order);

    await this.orderRepo.save(updatedOrder);
    return 'order updated';
  }

  async updateOrderStatus(orderId: string, orderStatus: OrderUpdateStatusDto) {
    const order = await this.orderRepo.findOneBy({ orderId });
    if (!order) {
      return new NotFoundException('order not found');
    }

    const updatedOrder = Object.assign(order, orderStatus);

    await this.orderRepo.save(updatedOrder);
    return 'order status updated';
  }
}
