import { ProductModel } from '@octocloud/generators';
import { ProductModelStorage } from '../storage/ProductStorage';
import { ProductWithAvailabilityModel } from '../models/ProductWithAvailabilityModel';

interface IProductRepository {
  getProducts: () => ProductModel[];
  getProductsWithAvailability: () => ProductWithAvailabilityModel[];
  getProduct: (id: string) => ProductModel;
  getProductWithAvailability: (id: string) => ProductWithAvailabilityModel;
}

export class ProductRepository implements IProductRepository {
  private readonly storage = new ProductModelStorage();

  public getProducts = (): ProductModel[] => this.storage.getAll();

  public getProductsWithAvailability = (): ProductWithAvailabilityModel[] => this.storage.getAllWithAvailabilities();

  public getProduct = (id: string): ProductModel => this.storage.get(id);

  public getProductWithAvailability = (id: string): ProductWithAvailabilityModel =>
    this.storage.getWithAvailability(id);
}
