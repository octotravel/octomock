import * as yup from "yup";
import { AvailabilityUnit } from "./Availability";

export type AvailabilityCalendarSchema = {
  productId: string;
  optionId: string;
  localDateStart?: string;
  localDateEnd?: string;
  currency?: string;
  units?: AvailabilityUnit[];
};

export const availabilityCalendarSchema: yup.SchemaOf<AvailabilityCalendarSchema> = yup
  .object()
  .shape({
    productId: yup.string().required(),
    optionId: yup.string().required(),
    localDateStart: yup.string().required(),
    localDateEnd: yup.string().required(),
    currency: yup.string().notRequired(),
    units: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.string().required(),
          quantity: yup.number().required(),
        })
      )
      .notRequired()
      .nullable(),
  });
