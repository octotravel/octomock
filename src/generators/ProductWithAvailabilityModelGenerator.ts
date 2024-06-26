import { ProductModelGenerator, PartialProduct } from '@octocloud/generators';
import {
  Currency,
  UnitType,
  DurationUnit,
  Pricing,
  AvailabilityType,
  OpeningHours,
  PricingPer,
} from '@octocloud/types';
import { ProductWithAvailabilityModel } from '../models/ProductWithAvailabilityModel';
import { Capacity, Month, ProductAvailabilityModel, Day } from '../models/ProductAvailabilityModel';

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
          id: '9cbd7f33-6b53-45c4-a44b-730605f68753',
          internalName: 'PPU - OH',
          availabilityType: AvailabilityType.OPENING_HOURS,
          options: [
            {
              units: [
                {
                  id: 'adult',
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
          openingHours: [{ from: '09:00', to: '17:00' }],
          freesale: true,
          monthsClosed: [],
          capacityValue: 10,
          capacity: new Map([
            [Day.Mon, 10],
            [Day.Tue, 20],
          ]),
        },
      }),
      this.generateProduct({
        productData: {
          id: 'b5c0ab15-6575-4ca4-a39d-a8c7995ccbda',
          internalName: 'PPB - OH',
          availabilityType: AvailabilityType.OPENING_HOURS,
          options: [
            {
              units: [
                {
                  id: 'adult',
                  type: UnitType.ADULT,
                },
              ],
              restrictions: {
                minUnits: 2,
                maxUnits: null,
                minPaxCount: 0,
                maxPaxCount: null,
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
          openingHours: [{ from: '09:00', to: '17:00' }],
          freesale: true,
          daysClosed: [Day.Sat],
          daysSoldOut: [Day.Sun],
        },
      }),
      this.generateProduct({
        productData: {
          id: 'bb9eb918-fcb5-4947-9fce-86586bbea111',
          internalName: 'PPU - ST',
          availabilityType: AvailabilityType.START_TIME,
          options: [
            {
              units: [
                {
                  id: 'adult',
                  type: UnitType.ADULT,
                  pricingFrom: [pricingAdult],
                },
                {
                  id: 'child',
                  type: UnitType.CHILD,
                  pricingFrom: [pricingChild],
                },
              ],
              availabilityLocalStartTimes: ['12:00', '14:00'],
              restrictions: {
                minUnits: 2,
                maxUnits: null,
                minPaxCount: 0,
                maxPaxCount: null,
              },
              durationAmount: '2',
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
          id: '0a8f2ef2-7469-4ef0-99fa-a67132ab0bce',
          internalName: 'PPB - ST',
          availabilityType: AvailabilityType.START_TIME,
          options: [
            {
              units: [
                {
                  id: 'adult',
                  type: UnitType.ADULT,
                },
              ],
              availabilityLocalStartTimes: ['12:00', '14:00'],
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
      this.generateProduct({
        productData: {
          id: '7ce0191c-5996-4d5a-9cc0-2c3f8e15cdd0',
          internalName: 'PPB - ST with unit uuid id',
          availabilityType: AvailabilityType.START_TIME,
          options: [
            {
              units: [
                {
                  id: 'unit_4dfcc783-4c70-40ca-ae43-754b04717fa8',
                  type: UnitType.ADULT,
                },
              ],
              availabilityLocalStartTimes: ['12:00', '14:00'],
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
      productData,
    });

    const productAvailabilityModel = new ProductAvailabilityModel({
      productModel,
      ...productAvailabilityModelData,
    });

    const productWithAvailabilityModel = new ProductWithAvailabilityModel({
      productModel,
      productAvailabilityModel,
    });

    return productWithAvailabilityModel;
  }
}
