import { UnitId } from "./../types/Unit";
import { ProductModel } from "./../models/Product";
import { CapabilityId } from "./../types/Capability";
import { ProductBuilder } from "./../builders/ProductBuilder";
import { Pricing, PricingPer } from "../types/Pricing";
import { AvailabilityType } from "../types/Availability";
import { Currency } from "../types/Currency";
import { UnitConfigModel } from "../models/UnitConfig";
import { OptionConfigModel } from "../models/OptionConfig";
import { DurationUnit } from "../types/Duration";
import { AvailabilityConfigModel } from "../models/AvailabilityConfig";

// TODO: Products to generate

// pricing per booking | opening hours
// pricing per booking | start times
// pricing per unit | opening hours
// pricing per unit | start times

const pricingAdult: Pricing = {
  original: 1000,
  retail: 1000,
  net: 10000,
  includedTaxes: [],
  currency: Currency.EUR,
  currencyPrecision: 2,
};

const pricingBooking: Pricing = {
  original: 4000,
  retail: 4000,
  net: 40000,
  includedTaxes: [],
  currency: Currency.EUR,
  currencyPrecision: 2,
};

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
        id: "1",
        name: "PPU | OH",
        availabilityConfig: new AvailabilityConfigModel({
          availabilityType: AvailabilityType.OPENING_HOURS,
          openingHours: [{ from: "09:00", to: "17:00" }],
        }),
        capabilities: this.capabilities,
        optionsConfig: [
          new OptionConfigModel({
            unitConfigModels: [
              new UnitConfigModel({
                id: UnitId.Adult,
                pricingFrom: [pricingAdult],
              }),
            ],
          }),
        ],
        pricingConfig: {
          currencies: [Currency.EUR],
          currency: Currency.EUR,
          pricingPer: PricingPer.UNIT,
        },
      })
    );
    this.products.push(
      this.builder.build({
        id: "2",
        name: "PPB | OH",
        availabilityConfig: new AvailabilityConfigModel({
          availabilityType: AvailabilityType.OPENING_HOURS,
          openingHours: [{ from: "09:00", to: "17:00" }],
        }),
        capabilities: this.capabilities,
        optionsConfig: [
          new OptionConfigModel({
            unitConfigModels: [
              new UnitConfigModel({
                id: UnitId.Adult,
              }),
            ],
            pricing: [pricingBooking],
          }),
        ],
        pricingConfig: {
          currencies: [Currency.EUR],
          currency: Currency.EUR,
          pricingPer: PricingPer.BOOKING,
        },
      })
    );
    this.products.push(
      this.builder.build({
        id: "3",
        name: "PPU | ST",
        availabilityConfig: new AvailabilityConfigModel({
          availabilityType: AvailabilityType.START_TIME,
          daysClosed: [0, 6],
        }),
        capabilities: this.capabilities,
        optionsConfig: [
          new OptionConfigModel({
            unitConfigModels: [
              new UnitConfigModel({
                id: UnitId.Adult,
                pricingFrom: [pricingAdult],
              }),
            ],
            localStartTimes: ["12:00", "14:00"],
            durationAmount: "2",
            durationUnit: DurationUnit.HOURS,
          }),
        ],
        pricingConfig: {
          currencies: [Currency.EUR],
          currency: Currency.EUR,
          pricingPer: PricingPer.UNIT,
        },
      })
    );

    this.products.push(
      this.builder.build({
        id: "4",
        name: "PPB | ST",
        availabilityConfig: new AvailabilityConfigModel({
          availabilityType: AvailabilityType.START_TIME,
        }),
        capabilities: this.capabilities,
        optionsConfig: [
          new OptionConfigModel({
            unitConfigModels: [
              new UnitConfigModel({
                id: UnitId.Adult,
              }),
            ],
            pricing: [pricingBooking],
            localStartTimes: ["12:00", "14:00"],
          }),
        ],
        pricingConfig: {
          currencies: [Currency.EUR],
          currency: Currency.EUR,
          pricingPer: PricingPer.BOOKING,
        },
      })
    );

    // this.products.push(
    //   this.builder.build({
    //     id: "5",
    //     name: "P2 Two Options",
    //     optionsConfig: [
    //       new OptionConfigModel({
    //         id: "1",
    //         name: "1",
    //         unitConfigModels: [
    //           new UnitConfigModel({
    //             id: UnitId.Adult,
    //             pricingFrom: [pricingAdult],
    //           }),
    //         ],
    //       }),
    //     ],
    //     availabilityType: AvailabilityType.OPENING_HOURS,
    //     pricingConfig: {
    //       currencies: [Currency.EUR],
    //       currency: Currency.EUR,
    //       pricingPer: PricingPer.UNIT,
    //     },
    //     capabilities: this.capabilities,
    //   })
    // );
  };
}
