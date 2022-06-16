import { InvalidAvailabilityIdErrorValidator } from "./../validators/backendValidator/Error/InvalidAvailabilityIdErrorValidator";
import { CapabilityId, Product } from "@octocloud/types";
import { ProductValidator } from "../validators/backendValidator/Product/ProductValidator";
import { ProductService } from "./../services/ProductService";

interface IProductController {
  getProducts(capabilities: CapabilityId[]): Product[];
  getProduct(id: string, capabilities: CapabilityId[]): Product;
}

export class ProductController implements IProductController {
  private productService = new ProductService();
  public getProducts = (capabilities: CapabilityId[]): Product[] => {
    return this.productService
      .getProducts()
      .map((model) => model.toPOJO({ useCapabilities: true, capabilities }));
  };
  public getProduct = (id: string, capabilities: CapabilityId[]): Product => {
    const product = this.productService
      .getProduct(id)
      .toPOJO({ useCapabilities: true, capabilities });

    const errors = new ProductValidator({ capabilities })
      .validate(product)
      .map((error) => error.message);
    console.log(errors);

    const errorss = new InvalidAvailabilityIdErrorValidator().validate({
      body: {
        error: "INVALID_AVAILABILITY_ID",
        errorMessage: "123",
        availabilityId: "asd",
      },
      status: 500,
    });
    console.log(errorss);
    return product;
  };
}
