import {
  AvailabilityCalendar,
  CapabilityId,
  AvailabilityStatus,
  OpeningHours
 } from '@octocloud/types';
import { CapableToPOJOType } from "../interfaces/Capable";
import { Capable } from "../interfaces/Capable";
import { AvailabilityPricingModel } from "./AvailabilityPricing";

export class AvailabilityCalendarModel implements Capable {
  public localDate: string;
  public available: boolean;
  public status: AvailabilityStatus;
  public vacancies: Nullable<number>;
  public capacity: Nullable<number>;
  public openingHours: OpeningHours[];

  public availabilityPricingModel?: AvailabilityPricingModel;

  constructor({
    localDate,
    available,
    status,
    vacancies,
    capacity,
    openingHours,
    availabilityPricing,
  }: {
    localDate: string;
    available: boolean;
    status: AvailabilityStatus;
    vacancies: Nullable<number>;
    capacity: Nullable<number>;
    openingHours: OpeningHours[];
    availabilityPricing: AvailabilityPricingModel;
  }) {
    this.localDate = localDate;
    this.available = available;
    this.status = status;
    this.vacancies = vacancies;
    this.capacity = capacity;
    this.openingHours = openingHours;

    this.availabilityPricingModel = availabilityPricing;
  }

  public toPOJO = ({
    useCapabilities = false,
    capabilities = [],
  }: CapableToPOJOType): AvailabilityCalendar => {
    const {
      localDate,
      available,
      status,
      vacancies,
      capacity,
      openingHours,
    } = this;

    const pojo: AvailabilityCalendar = {
      localDate,
      available,
      status,
      vacancies,
      capacity,
      openingHours,
    };

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pricing))
    ) {
      if (this.availabilityPricingModel.shouldUsePricing()) {
        pojo.pricingFrom = this.availabilityPricingModel.pricing;
      }
      if (this.availabilityPricingModel.shouldUseUnitPricing()) {
        pojo.unitPricingFrom = this.availabilityPricingModel.unitPricing;
      }
    }

    return pojo;
  };
}
