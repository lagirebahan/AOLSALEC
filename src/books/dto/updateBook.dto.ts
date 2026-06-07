import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateBookDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  totalCopies?: number;
}