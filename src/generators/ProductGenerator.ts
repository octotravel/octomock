import { ProductConfigModel } from "./../models/ProductConfig";
import { UnitId } from "./../types/Unit";
import { ProductModel } from "./../models/Product";
import { ProductBuilder } from "./../builders/ProductBuilder";
import { Pricing, PricingPer } from "../types/Pricing";
import { AvailabilityType } from "../types/Availability";
import { Currency } from "../types/Currency";
import { UnitConfigModel } from "../models/UnitConfig";
import { OptionConfigModel } from "../models/OptionConfig";
import { DurationUnit } from "../types/Duration";
import { AvailabilityConfigModel, Day } from "../models/AvailabilityConfig";

// TODO: Products to generate

// pricing per booking | opening hours
// pricing per booking | start times
// pricing per unit | opening hours
// pricing per unit | start times

const pricingAdult: Pricing = {
  original: 1000,
  retail: 1000,
  net: 1000,
  includedTaxes: [],
  currency: Currency.EUR,
  currencyPrecision: 2,
};

const pricingBooking: Pricing = {
  original: 4000,
  retail: 4000,
  net: 4000,
  includedTaxes: [],
  currency: Currency.EUR,
  currencyPrecision: 2,
};

export class ProductGenerator {
  private builder = new ProductBuilder();
  private products: ProductModel[] = [];

  constructor() {
    this.generateProducts();
  }

  public getProducts = (): ProductModel[] => {
    return this.products;
  };

  private generateProducts = (): void => {
    this.products.push(
      this.builder.build(
        new ProductConfigModel({
          id: "1",
          name: "PPU | OH",
          availabilityConfig: new AvailabilityConfigModel({
            availabilityType: AvailabilityType.OPENING_HOURS,
            openingHours: [{ from: "09:00", to: "17:00" }],
          }),
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
      )
    );
    this.products.push(
      this.builder.build(
        new ProductConfigModel({
          id: "2",
          name: "PPB | OH",
          availabilityConfig: new AvailabilityConfigModel({
            availabilityType: AvailabilityType.OPENING_HOURS,
            openingHours: [{ from: "09:00", to: "17:00" }],
            capacity: 20,
            daysClosed: [Day.Sat, Day.Sun],
          }),
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
      )
    );
    this.products.push(
      this.builder.build(
        new ProductConfigModel({
          id: "3",
          name: "PPU | ST",
          availabilityConfig: new AvailabilityConfigModel({
            availabilityType: AvailabilityType.START_TIME,
          }),
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
      )
    );

    this.products.push(
      this.builder.build(
        new ProductConfigModel({
          id: "4",
          name: "PPB | ST",
          availabilityConfig: new AvailabilityConfigModel({
            availabilityType: AvailabilityType.START_TIME,
          }),
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
      )
    );
  };
}
