import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateSiteDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Location is required' })
  @IsString()
  location: string;

  @IsNotEmpty({ message: 'Code name is required' })
  @IsString()
  code_name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsNotEmpty({ message: 'Frontend URL is required' })
  @IsUrl({}, { message: 'Invalid frontend URL' })
  frontend_url: string;

  @IsNotEmpty({ message: 'Backend URL is required' })
  @IsUrl({}, { message: 'Invalid backend URL' })
  backend_url: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subLocations?: string[];

  @IsOptional()
  @IsString()
  locationId?: string;
}
