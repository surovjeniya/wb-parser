import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class GoToAdvertsDto {
  @IsString()
  @IsNotEmpty()
  shop_name: string;

  @IsString()
  @IsNotEmpty()
  advert_id: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/, {
    message: 'Invalid date format. Should be like: DD:MM:YYYY',
  })
  start_date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/, {
    message: 'Invalid date format. Should be like: DD:MM:YYYY',
  })
  end_date: string;

  @IsBoolean()
  @IsOptional()
  with_content?: boolean;
}
