import { ProductModelStorage } from "../storage/ProductStorage";
import { ProductModel } from "@octocloud/generators";
import { ProductWithAvailabilityModel } from "../models/ProductWithAvailabilityModel";

interface IProductRepository {
  getProducts(): ProductModel[];
  getProductsWithAvailability(): ProductWithAvailabilityModel[];
  getProduct(id: string): ProductModel;
  getProductWithAvailability(id: string): ProductWithAvailabilityModel;
}

export class ProductRepository implements IProductRepository {
  private storage = new ProductModelStorage();

  public getProducts = (): ProductModel[] => {
    return this.storage.getAll();
  };

  public getProductsWithAvailability = (): ProductWithAvailabilityModel[] => {
    return this.storage.getAllWithAvailabilities();
  };

  public getProduct = (id: string): ProductModel => {
    return this.storage.get(id);
  };

  public getProductWithAvailability = (id: string): ProductWithAvailabilityModel => {
    return this.storage.getWithAvailability(id);
  };
}
