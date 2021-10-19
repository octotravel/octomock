import { AvailabilityType, OpeningHours } from "../types/Availability";

export class AvailabilityConfigModel {
  public days: number;
  public daysClosed: number[];
  public availabilityType: AvailabilityType;
  public openingHours: OpeningHours[];

  constructor({
    days,
    daysClosed,
    availabilityType,
    openingHours,
  }: {
    days?: number;
    daysClosed?: number[];
    availabilityType?: AvailabilityType;
    openingHours?: OpeningHours[];
  }) {
    this.days = days ?? 30;
    this.daysClosed = daysClosed ?? [];
    this.availabilityType = availabilityType ?? AvailabilityType.START_TIME;
    this.openingHours = openingHours ?? [];
  }
}
