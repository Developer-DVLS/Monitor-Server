import { Command, CommandRunner } from 'nest-commander';
import { SeederService } from './seeder.service';

@Command({
  name: 'seed:db',
  description: 'Seed the database with initial data from external API',
})
export class SeederCommand extends CommandRunner {
  constructor(private readonly seederService: SeederService) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting database seeding...');
    await this.seederService.seedDatabase();
    console.log('Seeding completed.');
  }
}
