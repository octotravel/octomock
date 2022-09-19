import * as R from "ramda";
import { AvailabilityType, Product } from "@octocloud/types";
import {
  ErrorType,
  ValidatorError,
} from "../../../validators/backendValidator/ValidatorHelpers";
import { ProductBookable } from "./ProductBookable";

export class ProductConfig {
  private _openingHourProducts: Product[] = [];
  private _startTimeProducts: Product[] = [];
  private _products: Product[] = [];
  private _soldOutProduct: ProductBookable;
  private _availableProducts: [ProductBookable, ProductBookable];

  public setProducts = (products: Product[]): ValidatorError[] => {
    this._products = products;
    if (this.invalidDataProvided) {
      console.log("fapity");
      return [
        new ValidatorError({
          type: ErrorType.CRITICAL,
          message: `No products provided`,
        }),
      ];
    }
    const errors = new Array<ValidatorError>();
    const startTimeProducts = products.filter(
      (p) => p.availabilityType === AvailabilityType.START_TIME
    );

    this._startTimeProducts = startTimeProducts;
    if (!this.hasStartTimeProducts) {
      errors.push(
        new ValidatorError({
          message: `No products with availabilityType=${AvailabilityType.START_TIME} provided`,
        })
      );
    }

    const openingHourProducts = products.filter(
      (p) => p.availabilityType === AvailabilityType.OPENING_HOURS
    );
    this._openingHourProducts = openingHourProducts;
    if (!this.hasOpeningHourProducts) {
      errors.push(
        new ValidatorError({
          message: `No products with availabilityType=${AvailabilityType.OPENING_HOURS} provided`,
        })
      );
    }

    return errors;
  };

  public get invalidDataProvided() {
    return (
      R.isEmpty(this._products) ||
      R.isNil(this._products) ||
      !R.is(Array, this._products)
    );
  }

  public set soldOutProduct(soldOutProduct: ProductBookable) {
    this._soldOutProduct = soldOutProduct;
  }

  public get soldOutProduct() {
    return this._soldOutProduct;
  }

  public set availableProducts(
    availableProducts: [ProductBookable, ProductBookable]
  ) {
    this._availableProducts = availableProducts;
  }

  public get availableProducts() {
    return this._availableProducts;
  }

  public get hasOpeningHourProducts() {
    return this._openingHourProducts.length !== 0;
  }

  public get hasStartTimeProducts() {
    return this._startTimeProducts.length !== 0;
  }

  public get products() {
    return this._products;
  }

  public get startTimeProducts() {
    return this._startTimeProducts;
  }

  public get openingHourProducts() {
    return this._openingHourProducts;
  }
}
