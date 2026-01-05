import { CommandFactory } from 'nest-commander';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { SeederModule } from './src/seeder/seeder.module';
import { SitesSchema } from 'src/sites/entities/site.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    {
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: 'site-status.db',
          entities: [SitesSchema],
          synchronize: false,
        }),

        HttpModule,

        SeederModule,
      ],
    },
    { logger: ['error', 'warn', 'log'] },
  );

  await CommandFactory.runApplication(app);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('CLI failed:', err);
  process.exit(1);
});
