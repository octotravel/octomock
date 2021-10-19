export class AvailabilityContentModel {
  public meetingPoint: Nullable<string>;
  public meetingPointCoordinates: Nullable<[number]>;
  public meetingPointLatitude?: Nullable<number>;
  public meetingPointLongitude?: Nullable<number>;
  public meetingLocalDateTime: Nullable<string>;

  constructor() {
    this.meetingPoint = null;
    this.meetingPointCoordinates = null;
    this.meetingLocalDateTime = null;
    this.meetingPointLatitude = null;
    this.meetingPointLongitude = null;
    this.meetingLocalDateTime = null;
  }
}
