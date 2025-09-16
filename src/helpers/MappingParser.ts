import { MappingParser as BaseMappingParser } from '@octocloud/generators';
import { Mapping } from '@octocloud/types';
import { ExpediaMappingModel } from '../services/mapping/reseller/ExpediaGetMappingService';
import { GetYourGuideMappingModel } from '../services/mapping/reseller/GetYourGuideGetMappingService';
import { ViatorMappingModel } from '../services/mapping/reseller/ViatorGetMappingService';

export class MappingParser {
  private readonly baseParser = new BaseMappingParser();

  public parseModelToPOJO(mappingModel: ViatorMappingModel | GetYourGuideMappingModel | ExpediaMappingModel): Mapping {
    const baseMapping = this.baseParser.parseModelToPOJO(mappingModel);

    return {
      ...baseMapping,
      unitType: mappingModel.unitType,
    } as Mapping & { unitType: string | null };
  }
}
