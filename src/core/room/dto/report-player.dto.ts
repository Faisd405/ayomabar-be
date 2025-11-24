import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ReportPlayerDto {
  @ApiProperty({
    description: 'Reason for reporting the player',
    example: 'Toxic behavior and harassment',
    minLength: 10,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'Reason must be at least 10 characters long' })
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason: string;
}
