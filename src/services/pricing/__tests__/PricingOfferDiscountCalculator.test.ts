import { Pricing, NetDiscount, Currency } from '@octocloud/types';
import { PricingOfferDiscountCalculator } from '../PricingOfferDiscountCalculator';
import { OfferWithDiscountModel } from '../../../models/OfferWithDiscountModel';
import { OfferDiscountType } from '../../../models/OfferDiscountModel';

describe('PricingOfferDiscountCalculator', () => {
  const pricingOfferDiscountCalculator = new PricingOfferDiscountCalculator();

  describe('createDiscountedPricing', () => {
    const pricing: Pricing = {
      original: 900,
      retail: 900,
      net: 563,
      currency: Currency.EUR,
      currencyPrecision: 2,
      includedTaxes: [
        {
          name: 'Besonders Tax Rate (19%)',
          original: 144,
          retail: 144,
          net: 90,
        },
      ],
    };

    it('should calculate discounted pricing based on percentage amount with full net discount', async () => {
      const discountedPricingFullNetDiscount: Pricing = {
        original: 900,
        retail: 810,
        net: 473,
        currency: Currency.EUR,
        currencyPrecision: 2,
        includedTaxes: [
          {
            name: 'Besonders Tax Rate (19%)',
            original: 144,
            retail: 129,
            net: 75,
          },
        ],
      };

      const tenPercentOffFullNetDiscount: OfferWithDiscountModel = new OfferWithDiscountModel({
        offerModel: {
          code: 'promotion_395fa759-8c9b-467b-9914-603d0d533405',
          title: '10% OFF',
          description: 'Winter Special 10% off',
          netDiscount: NetDiscount.FULL,
          restrictions: {
            minUnits: 0,
            maxUnits: null,
            minTotal: 0,
            maxTotal: null,
            unitIds: [],
          },
        },
        offerDiscountModel: {
          type: OfferDiscountType.PERCENTAGE,
          amount: 10,
        },
      });

      const discountedPricing = pricingOfferDiscountCalculator.createDiscountedPricing(
        pricing,
        tenPercentOffFullNetDiscount,
      );

      expect(discountedPricing).toStrictEqual(discountedPricingFullNetDiscount);
    });

    it('should calculate discounted pricing based on percentage amount with split net discount', async () => {
      const discountedPricingSplitNetDiscount: Pricing = {
        original: 900,
        retail: 810,
        net: 518,
        currency: Currency.EUR,
        currencyPrecision: 2,
        includedTaxes: [
          {
            name: 'Besonders Tax Rate (19%)',
            original: 144,
            retail: 129,
            net: 82,
          },
        ],
      };

      const tenPercentOffSplitNetDiscount: OfferWithDiscountModel = new OfferWithDiscountModel({
        offerModel: {
          code: 'promotion_395fa759-8c9b-467b-9914-603d0d533405',
          title: '10% OFF',
          description: 'Winter Special 10% off',
          netDiscount: NetDiscount.SPLIT,
          restrictions: {
            minUnits: 0,
            maxUnits: null,
            minTotal: 0,
            maxTotal: null,
            unitIds: [],
          },
        },
        offerDiscountModel: {
          type: OfferDiscountType.PERCENTAGE,
          amount: 10,
        },
      });

      const discountedPricing = pricingOfferDiscountCalculator.createDiscountedPricing(
        pricing,
        tenPercentOffSplitNetDiscount,
      );

      expect(discountedPricing).toStrictEqual(discountedPricingSplitNetDiscount);
    });

    it('should calculate discounted pricing based on flat amount with full net discount', async () => {
      const discountedPricingByFlatFullNetDiscount: Pricing = {
        original: 900,
        retail: 890,
        net: 553,
        currency: Currency.EUR,
        currencyPrecision: 2,
        includedTaxes: [
          {
            name: 'Besonders Tax Rate (19%)',
            original: 144,
            retail: 142,
            net: 88,
          },
        ],
      };

      const tenEurOffFullNetDiscount: OfferWithDiscountModel = new OfferWithDiscountModel({
        offerModel: {
          code: 'promotion_395fa759-8c9b-467b-9914-603d0d533405',
          title: '10 EUR OFF',
          description: 'Winter Special 10 EUR off',
          netDiscount: NetDiscount.FULL,
          restrictions: {
            minUnits: 0,
            maxUnits: null,
            minTotal: 0,
            maxTotal: null,
            unitIds: [],
          },
        },
        offerDiscountModel: {
          type: OfferDiscountType.FLAT,
          amount: 10,
        },
      });

      const discountedPricing = pricingOfferDiscountCalculator.createDiscountedPricing(
        pricing,
        tenEurOffFullNetDiscount,
      );

      expect(discountedPricing).toStrictEqual(discountedPricingByFlatFullNetDiscount);
    });
  });
});
