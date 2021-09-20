import { CapabilityId } from "./../types/Capability";
import { ProductModel } from "./../models/Product";
import { ProductGenerator } from "../generators/ProductGenerator";

export interface InMemoryStorage<T> {
  get(id: string, capabilities: CapabilityId[]): Nullable<T>;
  getAll(capabilities: CapabilityId[]): T[];
}

export class ProductModelInMemoryStorage
  implements InMemoryStorage<ProductModel>
{
  public get(id: string, capabilities: CapabilityId[]): Nullable<ProductModel> {
    return this.generateProducts(capabilities).find((p) => p.id === id) ?? null;
  }
  public getAll(capabilities: CapabilityId[]): ProductModel[] {
    return this.generateProducts(capabilities);
  }

  private generateProducts = (capabilities: CapabilityId[]) => {
    const generator = new ProductGenerator(capabilities);

    return generator.getProducts();
  };
}
