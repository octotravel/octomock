import { OpeningHours } from "../../types/Availability";
import { RegExpValidator } from "./ValidatorHelpers";

export class CommonValidator {
  public static validateOpeningHours = (
    label: string,
    openingHours: OpeningHours[]
  ): void => {
    const regExp = new RegExp(/^\d{2}:\d{2}$/g);
    openingHours.forEach((openingHour, i) => {
      RegExpValidator.validate(
        `${label}.openingHours[${i}].from`,
        openingHour.from,
        regExp
      );
      RegExpValidator.validate(
        `${label}.openingHours[${i}].to`,
        openingHour.to,
        regExp
      );
    });
  };
}
