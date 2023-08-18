import { Body, Controller, Post } from '@nestjs/common';
import { WbService } from './wb.service';
import { AdvertStatDto } from './dto/advert-stat.dto';

@Controller('wb')
export class WbController {
  constructor(private readonly wbService: WbService) {}

  @Post('advert-stat')
  async getAdvertStat(@Body() dto: AdvertStatDto) {
    return await this.wbService.getAdvertStat(dto);
  }
}
