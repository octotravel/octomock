import { InMemoryStorage } from "./InMemoryStorage";
import { InvalidProductIdError } from "../models/Error";
import { ProductModel } from "../models/Product";
import { ProductGenerator } from "../generators/ProductGenerator";

export class ProductModelStorage implements InMemoryStorage<ProductModel> {
  public get(id: string): Nullable<ProductModel> {
    const model = this.generateProducts().find((p) => p.id === id) ?? null;
    if (model === null) {
      throw new InvalidProductIdError(id);
    }
    return model;
  }
  public getAll(): ProductModel[] {
    return this.generateProducts();
  }

  private generateProducts = () => {
    const generator = new ProductGenerator();

    return generator.getProducts();
  };
}
