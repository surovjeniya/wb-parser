import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AdvertStatDto } from './dto/advert-stat.dto';
import { wbApiInstance } from './utils/wb-api';
import { WB_MANAGER_TOKEN, WB_MANAGER_UID } from './constant/shops-ids.contant';
import { getBoostersData } from './utils/get-booster-by-article.utils';

@Injectable()
export class WbService {
  async getCardRating(nmId: number) {
    const details = await wbApiInstance.getCardDetail(nmId);
    const userRating = details.data.products.find((item) => item.id === nmId);
    return userRating.reviewRating;
  }

  sumFieldsByNmId(inputArray: any[]): unknown[] {
    const resultMap = {};

    for (const item of inputArray) {
      const nmId = item.nmId;

      if (!resultMap[nmId]) {
        resultMap[nmId] = { ...item };
      } else {
        for (const key in item) {
          if (key !== 'nmId' && key !== 'name') {
            resultMap[nmId][key] += item[key];
          }
        }
      }
    }

    return Object.values(resultMap);
  }

  generateDateRangeArray(startDate: Date, endDate: Date): string[] {
    const dateArray = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dateArray.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  }

  async getAdvertStat({
    start_date,
    end_date,
    advert_id,
    supplierID,
  }: AdvertStatDto) {
    let content = [];

    const data = await wbApiInstance.getAdvertFullStat(
      advert_id,
      supplierID,
      WB_MANAGER_UID,
      WB_MANAGER_TOKEN,
    );

    if (!data) {
      throw new InternalServerErrorException('Wb api error.Try again.');
    }
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const dateRangeArray = this.generateDateRangeArray(startDate, endDate);
      for await (const datE of dateRangeArray) {
        const dataByDaysPeriod = data.content.days.find((item) =>
          item.date.includes(datE),
        );
        if (!dataByDaysPeriod) {
          throw new NotFoundException(
            `Adverts data with this date range not found.`,
          );
        }
        const { date, apps } = dataByDaysPeriod;

        content.push({
          date,
          // data: this.sumFieldsByNmId(apps.map((item) => item.nm.flat()).flat()),
          // boosterData: data.content.boosterStats.filter(
          //   (item) => item.date.split('T')[0] === date.split('T')[0],
          // ),
          data: getBoostersData(
            //@ts-ignore
            this.sumFieldsByNmId(apps.map((item) => item.nm.flat()).flat()),
            data?.content?.boosterStats
              ? data?.content?.boosterStats?.filter(
                  (item) => item.date.split('T')[0] === date.split('T')[0],
                )
              : [],
          ),
        });
      }
    } else {
      content = data.content.days.map(({ date, apps }) => ({
        date,
        // data: this.sumFieldsByNmId(apps.map((item) => item.nm.flat()).flat()),
        // boosterData: data.content.boosterStats.filter(
        //   (item) => item.date.split('T')[0] === date.split('T')[0],
        // ),
        data: getBoostersData(
          //@ts-ignore
          this.sumFieldsByNmId(apps.map((item) => item.nm.flat()).flat()),
          data?.content?.boosterStats
            ? data?.content?.boosterStats?.filter(
                (item) => item.date.split('T')[0] === date.split('T')[0],
              )
            : [],
        ),
      }));
    }
    return content;
  }
}
