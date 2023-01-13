import { Booking } from "@octocloud/types";
import { CreateBookingSchema } from "../../schemas/Booking";
import { Result } from "./api/types";
import { Config } from "./config/Config";
import { ProductBookable } from "./config/ProductBookable";

interface CreateReservationParams {
  invalidProductId?: boolean;
  invalidOptionId?: boolean;
  invalidAvailabilityId?: boolean;
  invalidUnitItems?: boolean;
  soldOutAvailability?: boolean;
  unitItemsMissing?: boolean;
  unitItemsEmpty?: boolean;
  unitItemsQuantity?: number;
}
export class Booker {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();

  public createReservation = async (
    productBookable: ProductBookable,
    params?: CreateReservationParams
  ): Promise<Result<Booking>> => {
    const { product } = productBookable;

    const productId = params?.invalidProductId ? this.config.invalidProductId : product.id;
    const optionId = params?.invalidOptionId
      ? this.config.invalidOptionId
      : productBookable.getOption().id;
    const availabilityId = this.getAvailabilityId(productBookable, params);
    const unitItems = this.getUnitItems(productBookable, params);

    const data = {
      productId,
      optionId,
      availabilityId,
    } as CreateBookingSchema;
    if (unitItems) {
      data.unitItems = unitItems;
    }

    return this.apiClient.bookingReservation(data);
  };

  private getAvailabilityId(productBookable: ProductBookable, params?: CreateReservationParams) {
    if (params?.invalidAvailabilityId) {
      return this.config.invalidAvailabilityId;
    } else if (params?.soldOutAvailability) {
      return productBookable.availabilityIdSoldOut;
    }
    return productBookable.randomAvailabilityID;
  }

  private getUnitItems(productBookable: ProductBookable, params?: CreateReservationParams) {
    if (params?.invalidUnitItems) {
      return productBookable.getInvalidUnitItems();
    } else if (params?.unitItemsMissing) {
      return null;
    } else if (params?.unitItemsEmpty) {
      return [];
    }
    return productBookable.getValidUnitItems({
      quantity: params?.unitItemsQuantity,
    });
  }
}
