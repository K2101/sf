import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const apphttp = await NestFactory.create(AppModule);
  await apphttp.listen(3000);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['pkc-1dkx6.ap-southeast-1.aws.confluent.cloud:9092'],
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: 'QF3BLWOX3UWI3WL2',
            password:
              'kXgINuX3c7y2nnl4h53OKege7FRMHvuAx1bcbEwaSTD/jMh1B6Ej7B+E8+eEFq71',
          },
        },
        consumer: {
          groupId: 'AUTH_CONSUMER',
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
