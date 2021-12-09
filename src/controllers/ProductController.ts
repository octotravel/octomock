import { CapabilityId } from "./../types/Capability";
import { ProductService } from "./../services/ProductService";
import { Product } from "./../types/Product";

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
    return this.productService
      .getProduct(id)
      .toPOJO({ useCapabilities: true, capabilities });
  };
}
