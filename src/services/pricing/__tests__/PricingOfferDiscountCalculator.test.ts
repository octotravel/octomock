import { PricingOfferDiscountCalculator } from "../PricingOfferDiscountCalculator";
import { Pricing, NetDiscount, Currency } from "@octocloud/types";
import { OfferWithDiscountModel } from "../../../models/OfferWithDiscountModel";
import { OfferDiscountType } from "../../../models/OfferDiscountModel";

const PRICING: Pricing = {
  original: 900,
  retail: 900,
  net: 563,
  currency: Currency.EUR,
  currencyPrecision: 2,
  includedTaxes: [
    {
      name: "Besonders Tax Rate (19%)",
      original: 144,
      retail: 144,
      net: 90,
    },
  ],
};

const DISCOUNTED_PRICING_FULL_NET_DISCOUNT: Pricing = {
  original: 900,
  retail: 810,
  net: 473,
  currency: Currency.EUR,
  currencyPrecision: 2,
  includedTaxes: [
    {
      name: "Besonders Tax Rate (19%)",
      original: 144,
      retail: 129,
      net: 75,
    },
  ],
};

const TEN_PERCENT_OFF_FULL_NET_DISCOUNT: OfferWithDiscountModel = new OfferWithDiscountModel({
  offerModel: {
    code: "promotion_395fa759-8c9b-467b-9914-603d0d533405",
    title: "10% OFF",
    description: "Winter Special 10% off",
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

const DISCOUNTED_PRICING_SPLIT_NET_DISCOUNT: Pricing = {
  original: 900,
  retail: 810,
  net: 518,
  currency: Currency.EUR,
  currencyPrecision: 2,
  includedTaxes: [
    {
      name: "Besonders Tax Rate (19%)",
      original: 144,
      retail: 129,
      net: 67,
    },
  ],
};

const TEN_PERCENT_OFF_SPLIT_NET_DISCOUNT: OfferWithDiscountModel = new OfferWithDiscountModel({
  offerModel: {
    code: "promotion_395fa759-8c9b-467b-9914-603d0d533405",
    title: "10% OFF",
    description: "Winter Special 10% off",
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

describe("PricingOfferDiscountCalculator", () => {
  const pricingOfferDiscountCalculator = new PricingOfferDiscountCalculator();

  describe("createDiscountedPricing", () => {
    it("should calculate discounted pricing with full net discount", async () => {
      const discountedPricing = pricingOfferDiscountCalculator.createDiscountedPricing(
        PRICING,
        TEN_PERCENT_OFF_FULL_NET_DISCOUNT
      );

      expect(discountedPricing).toStrictEqual(DISCOUNTED_PRICING_FULL_NET_DISCOUNT);
    });
  });

  describe("createDiscountedPricing", () => {
    it("should calculate discounted pricing with split net discount", async () => {
      const discountedPricing = pricingOfferDiscountCalculator.createDiscountedPricing(
        PRICING,
        TEN_PERCENT_OFF_SPLIT_NET_DISCOUNT
      );

      expect(discountedPricing).toStrictEqual(DISCOUNTED_PRICING_SPLIT_NET_DISCOUNT);
    });
  });
});
