import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const apphttp = await NestFactory.create(AppModule);
  await apphttp.listen(3002);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
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
          groupId: 'PRODUCT_CONSUMER',
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
