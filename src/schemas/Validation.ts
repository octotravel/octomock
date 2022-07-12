import { CapabilityId } from "@octocloud/types";
import * as yup from "yup";

export interface ValidationConfig {
  url: string;
  capabilities: CapabilityId[];
  supplierId: string;
  productStartTimes: Product;
  productOpeningHours: Product;
}
interface Product {
  productId: string;
  optionId: string;
  available: {
    from: string;
    to: string;
  };
  unavailable: {
    from: string;
    to: string;
  };
  deliveryMethods: string[];
}

export const validationConfigSchema: yup.SchemaOf<ValidationConfig> = yup
  .object()
  .shape({
    url: yup.string().required(),
    capabilities: yup.array().required(),
    supplierId: yup.string().required(),
    productStartTimes: yup
      .object()
      .shape({
        productId: yup.string().required(),
        optionId: yup.string().required(),
        available: yup
          .object()
          .shape({
            from: yup.string().required(),
            to: yup.string().required(),
          })
          .required(),
        unavailable: yup
          .object()
          .shape({
            from: yup.string().required(),
            to: yup.string().required(),
          })
          .required(),
        deliveryMethods: yup.array().required(),
      })
      .required(),
    productOpeningHours: yup
      .object()
      .shape({
        productId: yup.string().required(),
        optionId: yup.string().required(),
        available: yup
          .object()
          .shape({
            from: yup.string().required(),
            to: yup.string().required(),
          })
          .required(),
        unavailable: yup
          .object()
          .shape({
            from: yup.string().required(),
            to: yup.string().required(),
          })
          .required(),
        deliveryMethods: yup.array().required(),
      })
      .required(),
  })
  .required();
