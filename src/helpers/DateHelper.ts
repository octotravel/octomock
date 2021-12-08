import format from "date-fns-tz/format";

export abstract class DateHelper {
  public static availabilityIdFormat = (
    date: Date,
    timeZone: string
  ): string => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssxxx", {
      timeZone: timeZone,
    });
  };
  public static availabilityDateFormat = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };
  public static bookingUTCFormat = (date: Date): string => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssX", {
      timeZone: "UTC",
    });
  };
}
