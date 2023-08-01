import { IsNotEmpty, IsString } from 'class-validator';

export class SendPhoneNumberDtoRequest {
  @IsNotEmpty()
  @IsString()
  phone_number: string;
}
