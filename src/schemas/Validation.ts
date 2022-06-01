import * as yup from "yup";
import { OctoMethod, ValidationData } from "../services/OctoValidationService";

export const validationSchema: yup.SchemaOf<ValidationData> = yup.object().shape({
    url: yup.string().required(),
    method: yup.mixed().oneOf(Object.values(OctoMethod)).required(),
  }).required();