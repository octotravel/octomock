import { ProductModelInMemoryStorage } from "./../storage/InMemoryStorage";
import { ProductModel } from "./../models/Product";

interface IProductRepository {
  getProducts(): ProductModel[];
  getProduct(id: string): ProductModel;
}

export class ProductRepository implements IProductRepository {
  private storage = new ProductModelInMemoryStorage();

  public getProducts = (): ProductModel[] => {
    return this.storage.getAll();
  };

  public getProduct = (id: string): Nullable<ProductModel> => {
    return this.storage.get(id);
  };
}
