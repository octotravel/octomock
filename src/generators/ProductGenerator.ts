import { ProductConfigModel } from "./../models/ProductConfig";
import {
  Pricing,
  UnitType,
  PricingPer,
  AvailabilityType,
  Currency,
  DurationUnit,
} from "@octocloud/types";
import { ProductModel } from "./../models/Product";
import { ProductBuilder } from "./../builders/ProductBuilder";
import { UnitConfigModel } from "../models/UnitConfig";
import { OptionConfigModel } from "../models/OptionConfig";
import {
  AvailabilityConfigModel,
  Day,
  Month,
} from "../models/AvailabilityConfig";

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

const pricingChild: Pricing = {
  original: 800,
  retail: 800,
  net: 800,
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

// TODO: add support for multiple currency and taxes

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
            monthsClosed: [Month.Feb],
            capacityValue: 10,
            capacity: new Map([
              [Day.Mon, 10],
              [Day.Tue, 20],
            ]),
          }),
          optionsConfig: [
            new OptionConfigModel({
              unitConfigModels: [
                new UnitConfigModel({
                  id: "adult",
                  type: UnitType.ADULT,
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
            freesale: true,
            daysClosed: [Day.Sat, Day.Sun],
          }),
          optionsConfig: [
            new OptionConfigModel({
              unitConfigModels: [
                new UnitConfigModel({
                  id: "adult",
                  type: UnitType.ADULT,
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
            capacityValue: 10,
            capacity: new Map([
              [Day.Mon, 10],
              [Day.Tue, 20],
            ]),
          }),
          optionsConfig: [
            new OptionConfigModel({
              unitConfigModels: [
                new UnitConfigModel({
                  id: "adult",
                  type: UnitType.ADULT,
                  pricingFrom: [pricingAdult],
                }),
                new UnitConfigModel({
                  id: "child",
                  type: UnitType.CHILD,
                  pricingFrom: [pricingChild],
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
                  id: "adult",
                  type: UnitType.ADULT,
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
