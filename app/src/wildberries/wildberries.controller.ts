import { Body, Controller, Get, Post } from '@nestjs/common';
import { WildberriesService } from './wildberries.service';

@Controller('wildberries')
export class WildberriesController {
  constructor(private readonly wildberriesService: WildberriesService) {}

  @Post('send-phone-number')
  async sendPhoneNumber(@Body() dto: any) {
    return await this.wildberriesService.sendPhoneNumber(dto.phone_number);
  }

  @Post('send-code')
  async sendCode(@Body() dto: any) {
    return await this.wildberriesService.sendCode(dto.code);
  }

  @Post('change-shop')
  async changeShop(@Body() dto: any) {
    return await this.wildberriesService.changeShop(dto.shop_id, dto.shop_name);
  }

  @Post('download-fourteen-order')
  async downloadFourteenOrder(@Body() dto: any) {
    return await this.wildberriesService.downloadFourteenOrder(
      dto.shop_name,
      dto.start_date,
      dto.end_date,
    );
  }

  @Post('go-to-analytics')
  async goToAnalytics(@Body() dto: any) {
    return await this.wildberriesService.gotoFourteenOrder(
      dto.shop_name,
      dto.start_date,
      dto.end_date,
    );
  }
}
