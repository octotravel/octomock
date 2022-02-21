import * as yup from "yup";

export type AvailabilitySchema = {
  productId: string;
  optionId: string;
  localDate?: string;
  localDateStart?: string;
  localDateEnd?: string;
  availabilityIds?: Array<string>;
  pickupRequested?: Nullable<boolean>;
  pickupPointId?: Nullable<string>;
  currency?: string;
  units?: AvailabilityUnit[];
};

export type AvailabilityUnit = {
  id: string;
  quantity: number;
};

export const availabilitySchema: yup.SchemaOf<AvailabilitySchema> = yup
  .object()
  .shape({
    productId: yup.string().required(),
    optionId: yup.string().required(),
    localDateStart: yup.string().notRequired(),
    localDateEnd: yup.string().notRequired(),
    localDate: yup.string().notRequired(),
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
    pickupRequested: yup.bool().notRequired().nullable(),
    pickupPointId: yup.string().notRequired().nullable(),
    availabilityIds: yup.array().of(yup.string()).notRequired(),
  });
