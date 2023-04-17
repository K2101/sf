import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { AuthEntity } from './app.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    ClientsModule.register([
      {
        name: 'AUTH_KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'AUTH',
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
            groupId: 'AUTH_CONSUMER',
          },
        },
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        // if error of database connection occur like
        // Unable to connect to the database. Retrying (1)...
        // please wait for coupple minute.
        url: 'postgres://khumhiran1995:XYkwhMqIP0F7@ep-delicate-haze-821089.ap-southeast-1.aws.neon.tech/auth',
        ssl: true,
        type: 'postgres',
        // host: 'localhost',
        // port: 5432,
        // username: 'postgres',
        // password: '123456',
        // database: 'auth',
        autoLoadEntities: true,
        // must be false in production and use migration instead.
        synchronize: true,
        entities: [AuthEntity],
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
