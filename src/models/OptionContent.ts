import { DurationUnit, Itinerary } from "@octocloud/types";

export class OptionContentModel {
  public title: string;
  public subtitle: string;
  public language: string;
  public shortDescription: string;
  public duration: string;
  public durationAmount: string;
  public durationUnit: DurationUnit;
  public itinerary: Nullable<Itinerary[]>;

  constructor({
    durationAmount,
    durationUnit,
  }: {
    durationUnit?: DurationUnit;
    durationAmount?: string;
  }) {
    this.title = "title";
    this.subtitle = "subtitle";
    this.language = "en";
    this.shortDescription = "shortDescription";
    this.durationUnit = durationUnit ?? DurationUnit.HOUR;
    this.durationAmount = durationAmount ?? "0";
    this.duration = `${this.durationAmount} ${this.durationUnit}`;
    this.itinerary = [];
  }
}
