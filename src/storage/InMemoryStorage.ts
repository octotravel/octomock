import { CapabilityId } from "./../types/Capability";
import { ProductModel } from "./../models/Product";
import { ProductGenerator } from "../generators/ProductGenerator";

export interface InMemoryStorage<T> {
  get(id: string): Nullable<T>;
  getAll(capabilities: CapabilityId[]): T[];
}

export class ProductModelInMemoryStorage
  implements InMemoryStorage<ProductModel>
{
  public get(id: string): Nullable<ProductModel> {
    return this.generateProducts().find((p) => p.id === id) ?? null;
  }
  public getAll(): ProductModel[] {
    return this.generateProducts();
  }

  private generateProducts = () => {
    const generator = new ProductGenerator();

    return generator.getProducts();
  };
}
