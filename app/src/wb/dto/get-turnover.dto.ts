import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class GetTurnoverDto {
  @IsNotEmpty()
  @IsString()
  supplierID: string;

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
}
