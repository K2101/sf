import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserEntity } from './user.entity';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ClientsModule.register([
      {
        name: 'USER_KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'USER',
            brokers: ['pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092'],
            ssl: true,
            sasl: {
              mechanism: 'plain',
              username: 'JOWQ2EBHP5ODPEAR',
              password:
                'u3E8l774vungMKsrX39i77RNLScporfGlhkDFhasn7Kdx/0At0CdaJGuqAO9WtG0',
            },
          },
          consumer: {
            groupId: 'USER_CONSUMER',
          },
        },
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        url: 'postgres://khumhiran1995:XYkwhMqIP0F7@ep-delicate-haze-821089.ap-southeast-1.aws.neon.tech/user',
        ssl: true,
        type: 'postgres',
        // host: 'localhost',
        // port: 5432,
        // username: 'postgres',
        // password: '123456',
        // database: 'user',
        autoLoadEntities: true,
        // must be false in production and use migration instead.
        synchronize: true,
        entities: [UserEntity],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
