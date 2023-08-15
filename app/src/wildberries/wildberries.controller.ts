import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
// import { WildberriesService } from './wildberries.service';
import { SendCodeDtoRequest } from './dto/send-code.dto';
import { SendPhoneNumberDtoRequest } from './dto/send-phone-number.dto';
import { GoToAdvertsDto } from './dto/go-to-adverts.dto';
import * as P from 'puppeteer';
import { delay } from './utils/wildberries.utils';
import { WildberriesService } from './wildberries.service';

@Controller('wildberries')
export class WildberriesController {
  @Get('test')
  async test() {
    let browser;
    try {
      console.log('dsd');
      browser = await P.connect({
        browserWSEndpoint: 'ws://nginx-service:80',
      });
      const page: P.Page = await browser.newPage();
      await page.goto(
        'https://seller.wildberries.ru/login/ru/?redirect_url=/',
        { waitUntil: 'load' },
      );
      await delay(5000);
      const content = await page.content();
      await browser.close();
      return content;
    } catch (error) {
      console.log(error.message);
    }
  }
  constructor(private readonly wildberriesService: WildberriesService) {}
  @Post('send-phone-number')
  async sendPhoneNumber(@Body() dto: SendPhoneNumberDtoRequest) {
    return await this.wildberriesService.sendPhoneNumber(
      dto.phone_number,
      dto.browser_idx,
    );
  }
  @Post('send-code')
  async sendCode(@Body() dto: SendCodeDtoRequest) {
    try {
      return await this.wildberriesService.sendCode(dto.code);
    } catch (error) {
      if (error.response && error.response.statusCode === 500) {
        throw new InternalServerErrorException(error.response.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
  // @Post('go-to-adverts')
  // async goToAdverts(@Body() dto: GoToAdvertsDto) {
  //   return await this.wildberriesService.goToAdverts(dto);
  // }
}
