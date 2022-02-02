import { ProductModelStorage } from "./../storage/ProductStorage";
import { ProductModel } from "./../models/Product";

interface IProductRepository {
  getProducts(): ProductModel[];
  getProduct(id: string): ProductModel;
}

export class ProductRepository implements IProductRepository {
  private storage = new ProductModelStorage();

  public getProducts = (): ProductModel[] => {
    return this.storage.getAll();
  };

  public getProduct = (id: string): Nullable<ProductModel> => {
    return this.storage.get(id);
  };
}
