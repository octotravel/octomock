import { ProductModel } from '@octocloud/generators';
import { ProductWithAvailabilityModelGenerator } from '../generators/ProductWithAvailabilityModelGenerator';
import { InvalidProductIdError } from '../models/Error';

import { ProductWithAvailabilityModel } from '../models/ProductWithAvailabilityModel';
import { InMemoryStorage } from './InMemoryStorage';

export class ProductModelStorage implements InMemoryStorage<ProductModel> {
  private readonly productWithAvailabilityModels = new Map<string, ProductWithAvailabilityModel>();

  private readonly productWithAvailabilityModelGenerator = new ProductWithAvailabilityModelGenerator();

  public constructor() {
    this.productWithAvailabilityModelGenerator.generateMultipleProducts().forEach((productWithAvailabilityModel) => {
      this.productWithAvailabilityModels.set(productWithAvailabilityModel.id, productWithAvailabilityModel);
    });
  }

  public get(id: string): ProductModel {
    return this.getWithAvailability(id).toProductModel();
  }

  public getWithAvailability(id: string): ProductWithAvailabilityModel {
    if (!this.productWithAvailabilityModels.has(id)) {
      throw new InvalidProductIdError(id);
    }

    return this.productWithAvailabilityModels.get(id)!;
  }

  public getAll(): ProductModel[] {
    return this.getAllWithAvailabilities().map((productWithAvailabilityModel) =>
      productWithAvailabilityModel.toProductModel(),
    );
  }

  public getAllWithAvailabilities(): ProductWithAvailabilityModel[] {
    return Array.from(this.productWithAvailabilityModels.values());
  }
}
