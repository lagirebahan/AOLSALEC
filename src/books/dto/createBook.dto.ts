import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  author!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalCopies?: number;
}