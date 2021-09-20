import { ProductModelInMemoryStorage } from "./../storage/InMemoryStorage";
import { CapabilityId } from "./../types/Capability";
import { ProductModel } from "./../models/Product";

interface IProductRepository {
  getProducts(capabilities: CapabilityId[]): ProductModel[];
  getProduct(id: string, capabilities: CapabilityId[]): ProductModel;
}

export class ProductRepository implements IProductRepository {
  private storage = new ProductModelInMemoryStorage();

  public getProducts = (capabilities: CapabilityId[]): ProductModel[] => {
    return this.storage.getAll(capabilities);
  };

  public getProduct = (
    id: string,
    capabilities: CapabilityId[]
  ): Nullable<ProductModel> => {
    return this.storage.get(id, capabilities);
  };
}
