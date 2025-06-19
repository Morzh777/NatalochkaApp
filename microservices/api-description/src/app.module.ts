import { Module } from '@nestjs/common';

import { DescriptionController } from './controllers/description.controller';
import { CompatibilityController } from './controllers/compatibility.controller';
import { ProgramController } from './controllers/program.controller';
import { PurposeController } from './controllers/purpose.controller';
import { DescriptionService } from './services/description.service';
import { CompatibilityService } from './services/compatibility.service';

@Module({
  imports: [],
  controllers: [
    DescriptionController,
    CompatibilityController,
    ProgramController,
    PurposeController,
  ],
  providers: [DescriptionService, CompatibilityService],
})
export class AppModule {}
