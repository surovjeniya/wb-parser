import {
  Body,
  Controller,
  Get,
  Header,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
// import { WildberriesService } from './wildberries.service';
import { SendCodeDtoRequest } from './dto/send-code.dto';
import { SendPhoneNumberDtoRequest } from './dto/send-phone-number.dto';
import { GoToAdvertsDto } from './dto/go-to-adverts.dto';
import * as P from 'puppeteer';
import { delay } from './utils/wildberries.utils';
import { WildberriesService } from './wildberries.service';
import { Request, Response } from 'express';
import axios from 'axios';
import * as xlsx from 'xlsx';
import * as fs from 'fs';

@Controller('wildberries')
export class WildberriesController {
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
  @Post('go-to-adverts')
  async goToAdverts(@Body() dto: GoToAdvertsDto) {
    const fileLink = await this.wildberriesService.goToAdverts(dto);
    return fileLink;
  }
}
