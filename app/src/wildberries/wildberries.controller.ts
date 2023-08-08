import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { WildberriesService } from './wildberries.service';
import { SendCodeDtoRequest } from './dto/send-code.dto';
import { SendPhoneNumberDtoRequest } from './dto/send-phone-number.dto';
import { GoToAdvertsDto } from './dto/go-to-adverts.dto';

@Controller('wildberries')
export class WildberriesController {
  constructor(private readonly wildberriesService: WildberriesService) {}

  @Post('send-phone-number')
  async sendPhoneNumber(@Body() dto: SendPhoneNumberDtoRequest) {
    try {
      return await this.wildberriesService.sendPhoneNumber(dto.phone_number);
    } catch (error) {
      if (error.response && error.response.statusCode === 401) {
        console.log(error);
        throw new UnauthorizedException(error.response.message);
      }
      if (error.response && error.response.statusCode === 500) {
        throw new InternalServerErrorException(error.response.message);
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
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

  @Post('go-to-adverts')
  async goToAdverts(@Body() dto: GoToAdvertsDto) {
    return await this.wildberriesService.goToAdverts(dto);
  }
}
