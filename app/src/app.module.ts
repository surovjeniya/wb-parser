import { Module } from '@nestjs/common';
import { WildberriesModule } from './wildberries/wildberries.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    WildberriesModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'downloads'),
    }),
  ],
})
export class AppModule {}
