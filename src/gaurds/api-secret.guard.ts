import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiSecretGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedSecret = request.headers['x-api-secret'];

    const expectedSecret = this.configService.get<string>('API_SECRET');

    if (!providedSecret || providedSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid API secret');
    }

    return true;
  }
}
