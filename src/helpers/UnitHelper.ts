import { OptionModel, UnitModel } from '@octocloud/generators';

export class UnitHelper {
  public static findUnitByTypeOrId(optionModel: OptionModel, unitId?: string, unitType?: string): UnitModel | null {
    if (unitId) {
      const unitModel = optionModel.findUnitModelByUnitId(unitId);
      if (unitModel !== null) {
        return unitModel;
      }
    }

    if (unitType) {
      const normalizedUnitType = unitType.toLowerCase();
      const unitModel = optionModel.unitModels.find((unit) => unit.type.toLowerCase() === normalizedUnitType);
      if (unitModel !== null) {
        return unitModel ?? null;
      }
    }

    const fallbackId = unitId || unitType?.toLowerCase();
    if (fallbackId) {
      return optionModel.findUnitModelByUnitId(fallbackId);
    }

    return null;
  }
}
