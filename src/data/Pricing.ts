import { Pricing } from "./../types/Pricing";

export const pricingEUR: Pricing = {
  original: 2513,
  retail: 2262,
  net: 2010,
  currency: "EUR",
  currencyPrecision: 2,
  includedTaxes: [
    {
      name: "VAT 10%",
      original: 113,
      retail: 102,
      net: 90,
    },
  ],
};
