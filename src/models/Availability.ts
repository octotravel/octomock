import {
  Availability,
  AvailabilityStatus,
  OpeningHours,
} from "../types/Availability";
import { CapabilityId } from "../types/Capability";
import { AvailabilityContentModel } from "./AvailabilityContent";
import { AvailabilityPickupModel } from "./AvailabilityPickup";
import { AvailabilityPricingModel } from "./AvailabilityPricing";

export class AvailabilityModel {
  public id: string;
  private localDateTimeStart: string;
  private localDateTimeEnd: string;
  private allDay: boolean;
  private available: boolean;
  private status: AvailabilityStatus;
  private vacancies: Nullable<number>;
  private capacity: Nullable<number>;
  private maxUnits: Nullable<number>;
  private utcCutoffAt: string;
  private openingHours: OpeningHours[];

  private availabilityContentModel?: AvailabilityContentModel;
  private availabilityPricingModel?: AvailabilityPricingModel;
  private availabilityPickupModel?: AvailabilityPickupModel;

  private capabilities: CapabilityId[] = [];

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

  public addContent = (): AvailabilityModel => {
    this.capabilities.push(CapabilityId.Content);
    return this;
  };

  public addPricing = (): AvailabilityModel => {
    this.capabilities.push(CapabilityId.Pricing);

    return this;
  };

  public addPickup = (): AvailabilityModel => {
    this.capabilities.push(CapabilityId.Pickups);
    return this;
  };

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

    if (this.capabilities.includes(CapabilityId.Content)) {
      Object.keys(this.availabilityContentModel).forEach((key) => {
        pojo[key] = this.availabilityContentModel[key];
      });
    }

    if (this.capabilities.includes(CapabilityId.Pricing)) {
      if (this.availabilityPricingModel.pricing) {
        pojo.pricing = this.availabilityPricingModel.pricing;
      } else if (this.availabilityPricingModel.unitPricing) {
        pojo.unitPricing = this.availabilityPricingModel.unitPricing;
      }
    }

    if (this.capabilities.includes(CapabilityId.Pickups)) {
      Object.keys(this.availabilityPickupModel).forEach((key) => {
        pojo[key] = this.availabilityPickupModel[key];
      });
    }

    return pojo;
  };
}
