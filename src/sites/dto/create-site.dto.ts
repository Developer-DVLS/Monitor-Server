import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
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
  @IsUrl({}, { message: 'Invalid printer URL' })
  printer_url: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  is_restaurant?: boolean;

  @IsNotEmpty({ message: 'Location ID is required' })
  @IsNumber()
  location_id: number;
}
