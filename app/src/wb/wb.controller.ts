import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WbService } from './wb.service';
import { AdvertStatDto } from './dto/advert-stat.dto';

@Controller('wb')
export class WbController {
  constructor(private readonly wbService: WbService) {}

  @Get('get-card-rating/:nmId')
  async getCardDetail(@Param('nmId') nmId: string) {
    return await this.wbService.getCardRating(Number(nmId));
  }

  @Post('advert-stat')
  async getAdvertStat(@Body() dto: AdvertStatDto) {
    return await this.wbService.getAdvertStat(dto);
  }
}
