import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { WB_MANGER_SHOPS_ENUM } from '../constant/shops-ids.contant';

export class AdvertStatDto {
  @IsNotEmpty()
  @IsString()
  advert_id: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Invalid date format.Date should be like YYYY-MM-DD',
  })
  start_date: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Invalid date format.Date should be like YYYY-MM-DD',
  })
  end_date: string;

  @IsNotEmpty()
  @IsEnum(WB_MANGER_SHOPS_ENUM, { each: true })
  shop_name: string;
}
