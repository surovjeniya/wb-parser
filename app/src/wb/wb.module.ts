import { Module } from '@nestjs/common';
import { WbService } from './wb.service';
import { WbController } from './wb.controller';

@Module({
  controllers: [WbController],
  providers: [WbService]
})
export class WbModule {}
