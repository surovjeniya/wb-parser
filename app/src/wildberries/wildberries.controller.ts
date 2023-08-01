import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { WildberriesService } from './wildberries.service';

@Controller('wildberries')
export class WildberriesController {
  constructor(private readonly wildberriesService: WildberriesService) {}

  @Post('send-phone-number')
  async sendPhoneNumber(@Body() dto: any) {
    try {
      return await this.wildberriesService.sendPhoneNumber(dto.phone_number);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('send-code')
  async sendCode(@Body() dto: any) {
    try {
      return await this.wildberriesService.sendCode(dto.code);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('change-shop')
  async changeShop(@Body() dto: any) {
    try {
      return await this.wildberriesService.changeShop(
        dto.shop_id,
        dto.shop_name,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('download-fourteen-order')
  async downloadFourteenOrder(@Body() dto: any) {
    try {
      return await this.wildberriesService.downloadFourteenOrder(
        dto.shop_name,
        dto.start_date,
        dto.end_date,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('go-to-analytics')
  async goToAnalytics(@Body() dto: any) {
    try {
      return await this.wildberriesService.gotoFourteenOrder(
        dto.shop_name,
        dto.start_date,
        dto.end_date,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
