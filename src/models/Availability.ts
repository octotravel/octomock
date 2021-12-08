import {
  Availability,
  AvailabilityStatus,
  OpeningHours,
} from "../types/Availability";
import { AvailabilityContentModel } from "./AvailabilityContent";
import { AvailabilityPickupModel } from "./AvailabilityPickup";
import { AvailabilityPricingModel } from "./AvailabilityPricing";

export class AvailabilityModel {
  public id: string;
  public localDateTimeStart: string;
  public localDateTimeEnd: string;
  public allDay: boolean;
  public available: boolean;
  public status: AvailabilityStatus;
  public vacancies: Nullable<number>;
  public capacity: Nullable<number>;
  public maxUnits: Nullable<number>;
  public utcCutoffAt: string;
  public openingHours: OpeningHours[];

  public availabilityContentModel?: AvailabilityContentModel;
  public availabilityPricingModel?: AvailabilityPricingModel;
  public availabilityPickupModel?: AvailabilityPickupModel;

  constructor({
    id,
    localDateTimeStart,
    localDateTimeEnd,
    allDay,
    available,
    status,
    vacancies,
    capacity,
    maxUnits,
    utcCutoffAt,
    openingHours,
  }: {
    id: string;
    localDateTimeStart: string;
    localDateTimeEnd: string;
    allDay: boolean;
    available: boolean;
    status: AvailabilityStatus;
    vacancies: Nullable<number>;
    capacity: Nullable<number>;
    maxUnits: Nullable<number>;
    utcCutoffAt: string;
    openingHours: OpeningHours[];
  }) {
    this.id = id;
    this.localDateTimeStart = localDateTimeStart;
    this.localDateTimeEnd = localDateTimeEnd;
    this.allDay = allDay;
    this.available = available;
    this.status = status;
    this.vacancies = vacancies;
    this.capacity = capacity;
    this.maxUnits = maxUnits;
    this.utcCutoffAt = utcCutoffAt;
    this.openingHours = openingHours;

    const pricing = {
      original: 0,
      retail: 0,
      net: 0,
      currency: "USD",
      currencyPrecision: 0,
      includedTaxes: [],
    };
    this.availabilityContentModel = new AvailabilityContentModel();
    this.availabilityPricingModel = new AvailabilityPricingModel({ pricing });
    this.availabilityPickupModel = new AvailabilityPickupModel();
  }

  public toPOJO = (): Availability => {
    const {
      id,
      localDateTimeStart,
      localDateTimeEnd,
      allDay,
      available,
      status,
      vacancies,
      capacity,
      maxUnits,
      utcCutoffAt,
      openingHours,
    } = this;
    const pojo: Availability = {
      id,
      localDateTimeStart,
      localDateTimeEnd,
      allDay,
      available,
      status,
      vacancies,
      capacity,
      maxUnits,
      utcCutoffAt,
      openingHours,
    };

    Object.keys(this.availabilityContentModel).forEach((key) => {
      pojo[key] = this.availabilityContentModel[key];
    });

    if (this.availabilityPricingModel.pricing) {
      pojo.pricing = this.availabilityPricingModel.pricing;
    } else if (this.availabilityPricingModel.unitPricing) {
      pojo.unitPricing = this.availabilityPricingModel.unitPricing;
    }

    Object.keys(this.availabilityPickupModel).forEach((key) => {
      pojo[key] = this.availabilityPickupModel[key];
    });

    return pojo;
  };
}
