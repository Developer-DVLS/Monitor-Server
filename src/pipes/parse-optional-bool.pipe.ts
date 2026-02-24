import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseOptionalBoolPipe implements PipeTransform<
  string | undefined,
  boolean | undefined
> {
  transform(
    value: string | undefined,
    metadata: ArgumentMetadata,
  ): boolean | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    console.log('value', value, metadata);

    const lower = value.toLowerCase().trim();
    if (lower === 'true') {
      return true;
    }
    if (lower === 'false') {
      return false;
    }

    throw new BadRequestException(
      'Validation failed (expected "true" or "false" for is_restaurant)',
    );
  }
}
