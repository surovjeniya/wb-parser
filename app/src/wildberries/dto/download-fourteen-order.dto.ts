import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DownloadFourteenOrderDtoRequest {
  @IsNotEmpty()
  @IsString()
  shop_name: string;

  @IsNotEmpty()
  @IsString()
  start_date: string;

  @IsNotEmpty()
  @IsString()
  end_date: string;

  @IsOptional()
  @IsBoolean()
  parse_xlsx?: boolean;
}
