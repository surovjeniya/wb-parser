import axios, { isAxiosError } from 'axios';
import { WbAdvertInfo } from '../interface/get-adver-info-from-wb.interface';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ICardDetail } from '../interface/get-card-detail.interface';
import { ITurnover } from '../interface/get-turnover.interface';
import { ICardRating } from '../interface/get-card-rating.interface';
import { GetCardWbRatingDto } from '../dto/get-card-wb-rating.dto';

class WbAPi {
  private counter = 0;

  async getCardRating(dto: GetCardWbRatingDto) {
    try {
      const { data: cardRating } = await axios.post<ICardRating>(
        'https://card-rating.wildberries.ru/api/v2/rating/cards',
        dto,
      );
      return cardRating;
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.message);
      }
    }
  }

  async getTurnover(
    x_supplier_id_external: string,
    start_date: string,
    end_date: string,
  ) {
    try {
      const { data: turnover } = await axios.get<ITurnover>(
        `https://seller.wildberries.ru/ns/turnover/analytics-back/api/v1/turnover-report-daily-dynamics-table?dateFrom=${start_date}&dateTo=${end_date}&limit=10&offset=0`,
        {
          withCredentials: true,
          headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ru',
            Connection: 'keep-alive',
            'Content-Type': 'application/json',
            Cookie: `x-supplier-id-external=${x_supplier_id_external}; x-supplier-id=${x_supplier_id_external}; external-locale=ru; locale=ru; WILDAUTHNEW_V3=CDF1816DDB7121CBB8B23B117E220706677F7499F34516CCB5695332577698E9C35724D3C023D218206D1A306B0BB5183E7A97675E4178DDED933C0A7B1266457EB6D5EE75E66A10DF492E44348EF2E7042675E6EE09E96555262B229B684DE1796C1211BED57857449F5363700CB0188455925AF395509C422DD84A75C03B097EDC0DFF67D4A0EFA65CB240C3A197C476F0E4CD3E85B1A3400F3C4241DF5A9A102EFE04A06601ED723A6DF50974371C3EFFDAF89E2FA0AA57C08133534C89C11C3D4F90B5699C44385711BAA5249D1684CD0AC40016D13427B9AC1F1FF037FB984BF00176712CAE9303B5BAB2159A766068375C5B7A86C33362F2025F6EA5748871587992AA32DEA869ECC1E3678CE9F62ACAB1C7ED3297ECB941E26D0E98A03B1F7A998F2FA049A92E30C3922037E19B31FA34; ___wbu=2e04d715-bc4d-47eb-949c-6fafd20912e1.1691390948; BasketUID=1fea3e5e-1d5d-46e0-b624-ca4dcdec442c; _wbauid=438099561691390947; _wbauid=9731958981691066271; WBToken=AvWInTmiibvMDKLXxOoMQpFcaEWYBj3ss9bMaUzkkv4iQcnHqeBgzgnByUGri_aIo6tAGaa7Ch1GlUurzMOd29Qx2Mg6jwCaYf3dUpqZDfon2Q`,
            // Host: ' seller.wildberries.ru',
            Referer:
              'https://seller.wildberries.ru/analytics/turnover-dynamics',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.2 Safari/605.1.15',
          },
        },
      );
      return turnover;
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error.message);
      }
    }
  }

  async getCardDetail(nmId: number) {
    try {
      const { data } = await axios.get<ICardDetail>(
        `https://card.wb.ru/cards/detail?appType=1&curr=rub&dest=-1257786&regions=80,38,83,4,64,33,68,70,30,40,86,75,69,1,31,66,110,22,48,71,114&spp=32&nm=${nmId}`,
      );
      return data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.log(error);
      }
    }
  }

  async getAdvertFullStat(
    advert_id: string,
    x_supplier_id_external: string,
    wbauid: string,
    wb_token: string,
    delay?: number,
  ): Promise<WbAdvertInfo> {
    delay && (await new Promise((resolve) => setTimeout(resolve, delay)));
    return await axios
      .get(`https://cmp.wildberries.ru/backend/api/v3/fullstat/${advert_id}`, {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-control': ' no-store',
          Connection: 'keep-alive',
          'Content-Type': 'application/json',
          Cookie: `WILDAUTHNEW_V3=CDF1816DDB7121CBB8B23B117E220706677F7499F34516CCB5695332577698E9C35724D3C023D218206D1A306B0BB5183E7A97675E4178DDED933C0A7B1266457EB6D5EE75E66A10DF492E44348EF2E7042675E6EE09E96555262B229B684DE1796C1211BED57857449F5363700CB0188455925AF395509C422DD84A75C03B097EDC0DFF67D4A0EFA65CB240C3A197C476F0E4CD3E85B1A3400F3C4241DF5A9A102EFE04A06601ED723A6DF50974371C3EFFDAF89E2FA0AA57C08133534C89C11C3D4F90B5699C44385711BAA5249D1684CD0AC40016D13427B9AC1F1FF037FB984BF00176712CAE9303B5BAB2159A766068375C5B7A86C33362F2025F6EA5748871587992AA32DEA869ECC1E3678CE9F62ACAB1C7ED3297ECB941E26D0E98A03B1F7A998F2FA049A92E30C3922037E19B31FA34; BasketUID=1fea3e5e-1d5d-46e0-b624-ca4dcdec442c; _wbauid=${wbauid}; external-locale=ru; ___wbu=2e04d715-bc4d-47eb-949c-6fafd20912e1.1691390948;x-supplier-id-external=${x_supplier_id_external}; WBToken=${wb_token};um=uid%3Dw7TDssOkw7PCu8KwwrPCscKxwrDCssK4wrXCsA%253d%253d%3Aproc%3D100%3Aehash%3Dd41d8cd98f00b204e9800998ecf8427e;`,
          Host: 'cmp.wildberries.ru',
          Referer: `https://cmp.wildberries.ru/statistics/${advert_id}`,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'X-User-Id': 120013941,
          'sec-ch-ua':
            'Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': 'macOS',
        },
      })
      .then((response) => response.data)
      .catch((error) => {
        if (isAxiosError(error)) {
          const status = error.response.status;
          if (status === 401) {
            throw new UnauthorizedException('Wb unauthorized error.');
          }
          if (status === 500) {
            if (this.counter === 10) {
              console.error(
                `${this.getAdvertFullStat.name}`,
                `Wb api error.Number of attempts = ${this.counter}.Delay beteen requests = ${delay}`,
              );
              throw new InternalServerErrorException(
                `Wb api error.Number of attempts = ${this.counter}.Delay beteen requests = ${delay}`,
              );
            }
            this.counter++;
            console.log(this.counter);
            return this.getAdvertFullStat(
              advert_id,
              x_supplier_id_external,
              wbauid,
              wb_token,
              500,
            );
          }
        }
      });
  }
}

export const wbApiInstance = new WbAPi();
