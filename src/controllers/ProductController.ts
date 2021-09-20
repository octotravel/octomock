import { ProductRepository } from "./../repositories/ProductRepository";
import { Product } from "./../types/Product";
import { CapabilityId } from "./../types/Capability";

interface IProductController {
  getProducts(capabilities: CapabilityId[]): Product[];
  getProduct(id: string, capabilities: CapabilityId[]): Product;
}

export class ProductController implements IProductController {
  private productRepository = new ProductRepository();
  public getProducts = (capabilities: CapabilityId[]): Product[] => {
    return this.productRepository
      .getProducts(capabilities)
      .map((model) => model.toPOJO());
  };
  public getProduct = (id: string, capabilities: CapabilityId[]): Product => {
    return this.productRepository.getProduct(id, capabilities).toPOJO();
  };
}
