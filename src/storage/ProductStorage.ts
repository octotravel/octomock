import { InMemoryStorage } from "./InMemoryStorage";
import { InvalidProductIdError } from "../models/Error";

import { ProductWithAvailabilityModel } from "../models/ProductWithAvailabilityModel";
import { ProductWithAvailabilityModelGenerator } from "../generators/ProductWithAvailabilityModelGenerator";
import { ProductModel } from "@octocloud/generators";

export class ProductModelStorage implements InMemoryStorage<ProductModel> {
  private readonly productWithAvailabilityModels: Map<string, ProductWithAvailabilityModel> = new Map();
  private readonly productWithAvailabilityModelGenerator = new ProductWithAvailabilityModelGenerator();

  constructor() {
    this.productWithAvailabilityModelGenerator.generateMultipleProducts().forEach((productWithAvailabilityModel) => {
      this.productWithAvailabilityModels.set(productWithAvailabilityModel.id, productWithAvailabilityModel);
    });
  }

  public get(id: string): ProductModel {
    return this.getWithAvailability(id).toProductModel();
  }

  public getWithAvailability(id: string): ProductWithAvailabilityModel {
    if (this.productWithAvailabilityModels.has(id) == false) {
      throw new InvalidProductIdError(id);
    }

    return this.productWithAvailabilityModels.get(id)!;
  }

  public getAll(): ProductModel[] {
    return this.getAllWithAvailabilities().map((productWithAvailabilityModel) => {
      return productWithAvailabilityModel.toProductModel();
    });
  }

  public getAllWithAvailabilities(): ProductWithAvailabilityModel[] {
    return Array.from(this.productWithAvailabilityModels.values());
  }
}
