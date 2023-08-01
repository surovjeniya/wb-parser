import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WildberriesModule } from './wildberries/wildberries.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './envs/.development.env',
      isGlobal: true,
    }),
    WildberriesModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'downloads'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
