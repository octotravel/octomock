import * as yup from "yup";

export interface ValidationConfig {
  backend: {
    endpoint: string;
    type: string;
    apiKey: string;
  };
}

export const validationConfigSchema: yup.SchemaOf<ValidationConfig> = yup
  .object()
  .shape({
    backend: yup.object().shape({
      endpoint: yup.string().required(),
      type: yup.string().required(),
      apiKey: yup.string().required(),
    }),
  })
  .required();
