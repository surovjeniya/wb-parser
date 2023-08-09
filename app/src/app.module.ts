import { Module } from '@nestjs/common';
import { WildberriesModule } from './wildberries/wildberries.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './envs/.env',
      isGlobal: true,
    }),
    WildberriesModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'downloads'),
    }),
  ],
})
export class AppModule {}
