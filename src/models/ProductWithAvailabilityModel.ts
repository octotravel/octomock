import { ProductModel } from '@octocloud/generators';
import { ProductAvailabilityModel } from './ProductAvailabilityModel';

export class ProductWithAvailabilityModel extends ProductModel {
  public readonly productAvailabilityModel: ProductAvailabilityModel;

  public constructor({
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
