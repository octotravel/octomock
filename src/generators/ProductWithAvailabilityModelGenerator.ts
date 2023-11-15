import { ProductModelGenerator, PartialProduct } from "@octocloud/generators";
import {
  Currency,
  UnitType,
  DurationUnit,
  Pricing,
  AvailabilityType,
  OpeningHours,
  PricingPer,
} from "@octocloud/types";
import { ProductWithAvailabilityModel } from "../models/ProductWithAvailabilityModel";
import { Capacity, Month, ProductAvailabilityModel, Day } from "../models/ProductAvailabilityModel";

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

interface ProductAvailabilityModelData {
  days?: number;
  daysClosed?: Day[];
  daysSoldOut?: Day[];
  monthsClosed?: Month[];
  availabilityType?: AvailabilityType;
  openingHours?: OpeningHours[];
  capacity?: Capacity;
  capacityValue?: number;
  freesale?: boolean;
}

export class ProductWithAvailabilityModelGenerator {
  private readonly productModelGenerator = new ProductModelGenerator();

  public generateMultipleProducts(): ProductWithAvailabilityModel[] {
    const productWithAvailabilityModels: ProductWithAvailabilityModel[] = [];

    productWithAvailabilityModels.push(
      this.generateProduct({
        productData: {
          id: "1",
          internalName: "PPU - OH",
          availabilityType: AvailabilityType.OPENING_HOURS,
          options: [
            {
              units: [
                {
                  id: "adult",
                  type: UnitType.ADULT,
                  pricingFrom: [pricingAdult],
                },
              ],
            },
          ],
          defaultCurrency: Currency.EUR,
          availableCurrencies: [Currency.EUR],
          pricingPer: PricingPer.UNIT,
        },
        productAvailabilityModelData: {
          availabilityType: AvailabilityType.OPENING_HOURS,
          openingHours: [{ from: "09:00", to: "17:00" }],
          freesale: true,
          monthsClosed: [Month.Feb],
          capacityValue: 10,
          capacity: new Map([
            [Day.Mon, 10],
            [Day.Tue, 20],
          ]),
        },
      }),
      this.generateProduct({
        productData: {
          id: "2",
          internalName: "PPB - OH",
          availabilityType: AvailabilityType.OPENING_HOURS,
          options: [
            {
              units: [
                {
                  id: "adult",
                  type: UnitType.ADULT,
                },
              ],
              restrictions: {
                minUnits: 2,
                maxUnits: null,
              },
              pricing: [pricingBooking],
            },
          ],
          defaultCurrency: Currency.EUR,
          availableCurrencies: [Currency.EUR],
          pricingPer: PricingPer.BOOKING,
        },
        productAvailabilityModelData: {
          availabilityType: AvailabilityType.OPENING_HOURS,
          openingHours: [{ from: "09:00", to: "17:00" }],
          freesale: true,
          daysClosed: [Day.Sat],
          daysSoldOut: [Day.Sun],
        },
      }),
      this.generateProduct({
        productData: {
          id: "3",
          internalName: "PPU - ST",
          availabilityType: AvailabilityType.START_TIME,
          options: [
            {
              units: [
                {
                  id: "adult",
                  type: UnitType.ADULT,
                  pricingFrom: [pricingAdult],
                },
                {
                  id: "child",
                  type: UnitType.CHILD,
                  pricingFrom: [pricingChild],
                },
              ],
              availabilityLocalStartTimes: ["12:00", "14:00"],
              restrictions: {
                minUnits: 2,
                maxUnits: null,
              },
              durationAmount: "2",
              durationUnit: DurationUnit.HOUR,
            },
          ],
          defaultCurrency: Currency.EUR,
          availableCurrencies: [Currency.EUR],
          pricingPer: PricingPer.UNIT,
        },
        productAvailabilityModelData: {
          availabilityType: AvailabilityType.START_TIME,
          capacityValue: 10,
          capacity: new Map([
            [Day.Mon, 10],
            [Day.Tue, 20],
          ]),
          daysClosed: [Day.Sat],
          daysSoldOut: [Day.Sun],
        },
      }),
      this.generateProduct({
        productData: {
          id: "4",
          internalName: "PPB - ST",
          availabilityType: AvailabilityType.START_TIME,
          options: [
            {
              units: [
                {
                  id: "adult",
                  type: UnitType.ADULT,
                },
              ],
              availabilityLocalStartTimes: ["12:00", "14:00"],
              pricing: [pricingBooking],
            },
          ],
          defaultCurrency: Currency.EUR,
          availableCurrencies: [Currency.EUR],
          pricingPer: PricingPer.BOOKING,
        },
        productAvailabilityModelData: {
          availabilityType: AvailabilityType.START_TIME,
          daysClosed: [Day.Sat, Day.Sun],
        },
      }),
    );

    return productWithAvailabilityModels;
  }

  private generateProduct({
    productData,
    productAvailabilityModelData,
  }: {
    productData: PartialProduct;
    productAvailabilityModelData: ProductAvailabilityModelData;
  }): ProductWithAvailabilityModel {
    const productModel = this.productModelGenerator.generateProduct({
      productData: productData,
    });

    const productAvailabilityModel = new ProductAvailabilityModel({
      productModel,
      ...productAvailabilityModelData,
    });

    const productWithAvailabilityModel = new ProductWithAvailabilityModel({
      productModel: productModel,
      productAvailabilityModel: productAvailabilityModel,
    });

    return productWithAvailabilityModel;
  }
}
