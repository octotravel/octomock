import { ProductAvailabilityModel } from "./ProductAvailabilityModel";
import { ProductModel } from "@octocloud/generators";

export class ProductWithAvailabilityModel extends ProductModel {
  public readonly productAvailabilityModel: ProductAvailabilityModel;

  constructor({
    productModel,
    productAvailabilityModel,
  }: {
    productModel: ProductModel;
    productAvailabilityModel: ProductAvailabilityModel;
  }) {
    super({ ...productModel });
    this.productAvailabilityModel = productAvailabilityModel;
  }

  public toProductModel(): ProductModel {
    return new ProductModel({ ...this });
  }
}
