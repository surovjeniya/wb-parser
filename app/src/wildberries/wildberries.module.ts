import { Module } from '@nestjs/common';
import { WildberriesController } from './wildberries.controller';
import { WildberriesService } from './wildberries.service';

@Module({
  controllers: [WildberriesController],
  providers: [WildberriesService],
  imports: [],
})
export class WildberriesModule {}
