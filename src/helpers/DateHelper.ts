import format from "date-fns-tz/format";

export abstract class DateHelper {
  public static availabilityIdFormat = (date: Date, timeZone: string): string => {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssxxx", {
      timeZone,
    });
  };

  public static availabilityDateFormat = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  public static utcDateFormat = (date: Date): string => {
    return date.toISOString().split(".")[0] + "Z";
  };

  public static getTime(dateTime: string): string {
    return dateTime.split("T")[1].slice(0, 5);
  }

  public static getDate(dateTime: string): string {
    return dateTime.split("T")[0];
  }
}
