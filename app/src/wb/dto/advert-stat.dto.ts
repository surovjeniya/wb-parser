import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

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
  @IsString()
  supplierID: string;
}
