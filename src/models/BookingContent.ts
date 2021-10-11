export class BookingContentModel {
  public meetingPoint: Nullable<string>;
  public meetingPointCoordinates: Nullable<[number]>;
  public meetingLocalDateTime: Nullable<string>;
  public duration: string;
  public durationAmount: string;
  public durationUnit: string;

  constructor() {
    this.meetingPoint = null;
    this.meetingPointCoordinates = null;
    this.meetingLocalDateTime = null;
    this.duration = "24 hours";
    this.durationAmount = "24";
    this.durationUnit = "hour";
  }
}
