import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateSiteLocationDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Location is required' })
  @IsString()
  location: string;

  @IsNotEmpty({ message: 'Site ID is required' })
  @IsNumber()
  siteId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty({ message: 'Location ID is required' })
  @IsNumber()
  location_id: number;
}
