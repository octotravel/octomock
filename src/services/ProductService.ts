import { ProductRepository } from "./../repositories/ProductRepository";
import { ProductModel } from "./../models/Product";

interface IProductService {
  getProducts(): ProductModel[];
  getProduct(id: string): ProductModel;
}

export class ProductService implements IProductService {
  private productRepository = new ProductRepository();
  public getProducts = (): ProductModel[] => {
    return this.productRepository.getProducts();
  };
  public getProduct = (
    id: string,
  ): ProductModel => {
    return this.productRepository.getProduct(id);
  };
}
