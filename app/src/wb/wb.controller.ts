import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WbService } from './wb.service';
import { AdvertStatDto } from './dto/advert-stat.dto';
import { GetTurnoverDto } from './dto/get-turnover.dto';
import { GetCardWbRatingDto } from './dto/get-card-wb-rating.dto';

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

  @Post('get-turnover')
  async getTurnover(@Body() dto: GetTurnoverDto) {
    return await this.wbService.getTurnover(dto);
  }

  @Post('get-card-wb-rating')
  async getCardWbRating(@Body() dto: GetCardWbRatingDto) {
    return await this.wbService.getCardWbRatingDto(dto);
  }
}
