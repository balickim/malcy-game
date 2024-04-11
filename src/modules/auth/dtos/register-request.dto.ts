import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty()
  nick: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
