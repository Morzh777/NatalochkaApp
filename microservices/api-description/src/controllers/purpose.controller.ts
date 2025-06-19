import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import landDescriptions from '../data/JsonData/landDescriptions.json';
import skyDescriptions from '../data/JsonData/skyDescriptions.json';
import destDescriptions from '../data/JsonData/destDescriptions.json';
import partnerDescriptions from '../data/JsonData/relationships.json';
import relationDescriptions from '../data/JsonData/energies_k_point.json';
import moneyDescriptions from '../data/JsonData/money_channel_pointL.json';
import workDescriptions from '../data/JsonData/prof_descriptions.json';
import atmosphereCouple from '../data/JsonData/CoupleСompatibility/atmosphereCouple.json';
import appearance from '../data/JsonData/CoupleСompatibility/appearance.json';
import positiveMeaning from '../data/JsonData/CoupleСompatibility/positiveMeaning.json';
import materialMeaning from '../data/JsonData/CoupleСompatibility/materialMeaning.json';
import coupleTask from '../data/JsonData/CoupleСompatibility/coupleTask.json';
import attraction from '../data/JsonData/CoupleСompatibility/attraction.json';
import cache from '../data/JsonData/CoupleСompatibility/cache.json';
import cacheTrouble from '../data/JsonData/CoupleСompatibility/cacheTrouble.json';
interface PurposeDescription {
  title: string;
  description: string;
}

const datasets: Record<string, Record<string, PurposeDescription>> = {
  land: landDescriptions,
  sky: skyDescriptions,
  dest: destDescriptions,
  partner: partnerDescriptions,
  relation: relationDescriptions,
  money: moneyDescriptions,
  work: workDescriptions,
  atmCouple: atmosphereCouple,
  appearance: appearance,
  positiveMeaning: positiveMeaning,
  materialMeaning: materialMeaning,
  coupleTask: coupleTask,
  attraction: attraction,
  cache: cache,
  cacheTrouble: cacheTrouble,
};

@Controller('description')
export class PurposeController {
  @Get(':type/:num')
  getDescription(@Param('type') type: string, @Param('num') num: string) {
    const source = datasets[type];
    if (!source) {
      throw new NotFoundException(`Unknown type: ${type}`);
    }

    const description = source[num];
    if (!description) {
      console.warn(`⚠️ Not found [${type}] for: ${num}`);
      throw new NotFoundException('Not found');
    }

    return { number: num, ...description };
  }
}
