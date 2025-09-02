import * as yup from 'yup';

export interface GetMappingsQueryParamsSchema {
  productId?: string;
  optionId?: string;
  resellerReference?: string;
}

export const getMappingsQueryParamsSchema: yup.SchemaOf<GetMappingsQueryParamsSchema> = yup.object().shape({
  productId: yup.string().optional(),
  optionId: yup.string().optional(),
  resellerReference: yup.string().optional(),
});
