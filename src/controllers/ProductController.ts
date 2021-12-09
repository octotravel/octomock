import { ProductService } from "./../services/ProductService";
import { Product } from "./../types/Product";

interface IProductController {
  getProducts(): Product[];
  getProduct(id: string): Product;
}

export class ProductController implements IProductController {
  private productService = new ProductService();
  public getProducts = (): Product[] => {
    return this.productService.getProducts().map((model) => model.toPOJO());
  };
  public getProduct = (id: string): Product => {
    return this.productService.getProduct(id).toPOJO();
  };
}
