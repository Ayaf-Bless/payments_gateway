import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({ example: 200, description: 'Status code of the response' })
  statusCode: number;

  @ApiProperty({ example: 'Success', description: 'Response message' })
  message: string;
}
