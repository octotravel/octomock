import { DurationUnit, Pricing } from '@octocloud/types';
import { UnitConfigModel } from "./UnitConfig";

export class OptionConfigModel {
  public id: string;
  public name: string;
  public localStartTimes: string[];
  public pricingFrom?: Pricing[];
  public unitConfigModels: UnitConfigModel[];
  public minUnits: number;
  public maxUnits: Nullable<number>;
  public durationUnit: DurationUnit.HOURS;
  public durationAmount: string;

  constructor({
    id,
    name,
    localStartTimes,
    pricing,
    minUnits,
    maxUnits,
    unitConfigModels,
    durationUnit,
    durationAmount,
  }: {
    id?: string;
    name?: string;
    localStartTimes?: string[];
    pricing?: Pricing[];
    minUnits?: number;
    maxUnits?: number;
    unitConfigModels: UnitConfigModel[];
    durationUnit?: DurationUnit.HOURS;
    durationAmount?: string;
  }) {
    this.id = id ?? "DEFAULT";
    this.name = name ?? "DEFAULT";
    this.localStartTimes = localStartTimes ?? ["00:00"];
    this.pricingFrom = pricing;
    this.minUnits = minUnits ?? 0;
    this.maxUnits = maxUnits ?? null;
    this.unitConfigModels = unitConfigModels;
    this.durationUnit = durationUnit ?? DurationUnit.HOURS;
    this.durationAmount = durationAmount ?? "0";
  }
}
