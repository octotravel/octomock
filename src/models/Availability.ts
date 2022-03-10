import { CapabilityId } from "./../types/Capability";
import { CapableToPOJOType } from "./../interfaces/Capable";
import { Capable } from "../interfaces/Capable";
import {
  Availability,
  AvailabilityStatus,
  OpeningHours,
} from "../types/Availability";
import { AvailabilityContentModel } from "./AvailabilityContent";
import { AvailabilityPickupModel } from "./AvailabilityPickup";
import { AvailabilityPricingModel } from "./AvailabilityPricing";

export class AvailabilityModel implements Capable {
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
    availabilityPricing,
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
    availabilityPricing: AvailabilityPricingModel;
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

    this.availabilityContentModel = new AvailabilityContentModel();
    this.availabilityPricingModel = availabilityPricing;
    this.availabilityPickupModel = new AvailabilityPickupModel();
  }

  public toPOJO = ({
    useCapabilities = false,
    capabilities = [],
  }: CapableToPOJOType): Availability => {
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

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Content))
    ) {
      Object.keys(this.availabilityContentModel).forEach((key) => {
        pojo[key] = this.availabilityContentModel[key];
      });
    }

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pricing))
    ) {
      if (this.availabilityPricingModel.shouldUsePricing()) {
        pojo.pricing = this.availabilityPricingModel.pricing;
      }
      if (this.availabilityPricingModel.shouldUseUnitPricing()) {
        pojo.unitPricing = this.availabilityPricingModel.unitPricing;
      }
    }

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pickups))
    ) {
      Object.keys(this.availabilityPickupModel).forEach((key) => {
        pojo[key] = this.availabilityPickupModel[key];
      });
    }

    return pojo;
  };
}
