import { IsNotEmpty, IsString } from 'class-validator';

export class SendCodeDtoRequest {
  @IsNotEmpty()
  @IsString()
  code: string;
}
