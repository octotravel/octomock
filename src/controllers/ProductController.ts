import { CapabilityId, Product } from "@octocloud/types";
import { ProductParser } from "@octocloud/generators";
import { ProductRepository } from "../repositories/ProductRepository";

interface IProductController {
  getProducts(capabilities: CapabilityId[]): Product[];
  getProduct(id: string, capabilities: CapabilityId[]): Product;
}

export class ProductController implements IProductController {
  private readonly productRepository = new ProductRepository();
  private readonly productParser = new ProductParser();
  public getProducts = (capabilities: CapabilityId[]): Product[] => {
    return this.productRepository
      .getProducts()
      .map((productModel) =>
        this.productParser.parseModelToPOJOWithSpecificCapabilities(
          productModel,
          capabilities
        )
      );
  };
  public getProduct = (id: string, capabilities: CapabilityId[]): Product => {
    const productModel = this.productRepository.getProduct(id);
    const product = this.productParser.parseModelToPOJOWithSpecificCapabilities(
      productModel,
      capabilities
    );

    return {
      ...product,
      // allowFreesale: "asdasd" as any,
    };
    // return product;
  };
}
