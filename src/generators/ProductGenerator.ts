import { UnitId } from "./../types/Unit";
import { ProductModel } from "./../models/Product";
import { CapabilityId } from "./../types/Capability";
import { ProductBuilder } from "./../builders/ProductBuilder";
import { PricingPer } from "../types/Pricing";
import { AvailabilityType } from "../types/Availability";

// TODO: Products to generate

// pricing per booking | opening hours
// pricing per booking | start times
// pricing per unit | opening hours
// pricing per unit | start times

export class ProductGenerator {
  private builder = new ProductBuilder();
  private capabilities: CapabilityId[];
  private products: ProductModel[] = [];

  constructor(capabilities: CapabilityId[]) {
    this.capabilities = capabilities;
    this.generateProducts();
  }

  public getProducts = (): ProductModel[] => {
    return this.products;
  };

  private generateProducts = (): void => {
    this.products.push(
      this.builder.build({
        id: "123",
        name: "P1 Single Option",
        units: [UnitId.Adult],
        availabilityType: AvailabilityType.OPENING_HOURS,
        pricingPer: PricingPer.BOOKING,
        capabilities: this.capabilities,
      })
    );

    this.products.push(
      this.builder.build({
        id: "123456",
        name: "P2 Two Options",
        units: [UnitId.Adult, UnitId.Child, UnitId.Family, UnitId.Infant],
        optionsConfig: [
          {
            id: "123",
            name: "first Option",
          },
          {
            id: "123456",
            name: "second Option",
          },
        ],
        availabilityType: AvailabilityType.OPENING_HOURS,
        pricingPer: PricingPer.UNIT,
        capabilities: this.capabilities,
      })
    );
  };
}
