import { Module } from '@nestjs/common';

import { DbService } from '../services/db.service';
import { CalculateService } from '../services/calculate.service';

import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  controllers: [GatewayController],
  providers: [GatewayService, CalculateService, DbService],
})
export class GatewayModule {}
