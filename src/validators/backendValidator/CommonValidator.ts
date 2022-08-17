import { OpeningHours } from "@octocloud/types";
import { RegExpValidator, ValidatorError } from "./ValidatorHelpers";

interface CommonValidatorParams {
  nullable?: boolean;
}

export class CommonValidator {
  public static validateOpeningHours = (
    label: string,
    openingHours: OpeningHours[]
  ): ValidatorError[] => {
    const regExp = new RegExp(/^\d{2}:\d{2}$/g);
    return openingHours
      .map((openingHour, i) => [
        RegExpValidator.validate(
          `${label}.openingHours[${i}].from`,
          openingHour.from,
          regExp
        ),
        RegExpValidator.validate(
          `${label}.openingHours[${i}].to`,
          openingHour.to,
          regExp
        ),
      ])
      .flat(1)
      .filter(Boolean);
  };

  public static validateLocalDate = (
    label: string,
    localDateTime: string
  ): ValidatorError => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/
    );
    return RegExpValidator.validate(label, localDateTime, regExp);
  };

  public static validateLocalDateTime = (
    label: string,
    localDateTime: string
  ): ValidatorError => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])([+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$/
    );
    return RegExpValidator.validate(label, localDateTime, regExp);
  };

  public static validateUTCDateTime = (
    label: string,
    utcDate: string,
    params?: CommonValidatorParams
  ): ValidatorError => {
    const regExp = new RegExp(
      /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])Z$/
    );
    if (params?.nullable) {
      console.log(utcDate);
      if (utcDate !== null) {
        return RegExpValidator.validate(label, utcDate, regExp);
      } else {
        return new ValidatorError(
          `${label} must be a \`utcDate\` or \`null\` type, but the final value was: \`${utcDate}\``
        );
      }
    } else {
      return RegExpValidator.validate(label, utcDate, regExp);
    }
  };
}
