import { Module } from '@nestjs/common';
import { WbModule } from './wb/wb.module';

@Module({
  imports: [WbModule],
})
export class AppModule {}
