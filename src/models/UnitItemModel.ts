import { UnitModel } from "./Unit";
import {
  CapabilityId,
  BookingStatus,
  Contact,
  Ticket,
  UnitItem,
  Pricing,
} from "@octocloud/types";
import { CapableToPOJOType } from "./../interfaces/Capable";
import { Capable } from "../interfaces/Capable";

export class UnitItemModel implements Capable {
  public uuid: string;
  public resellerReference: Nullable<string>;
  public supplierReference: Nullable<string>;
  public unitModel: UnitModel;
  public status: BookingStatus;
  public utcRedeemedAt: Nullable<string>;
  public contact: Contact;
  public ticket: Nullable<Ticket>;
  public pricing: Pricing;

  constructor({
    uuid,
    resellerReference,
    supplierReference,
    unitModel,
    status,
    utcRedeemedAt,
    contact,
    ticket,
  }: {
    uuid: string;
    resellerReference: Nullable<string>;
    supplierReference: Nullable<string>;
    unitModel: UnitModel;
    status: BookingStatus;
    utcRedeemedAt?: Nullable<string>;
    contact?: Contact;
    ticket: Ticket;
  }) {
    this.uuid = uuid;
    this.resellerReference = resellerReference;
    this.supplierReference = supplierReference;
    this.unitModel = unitModel;
    this.status = status;
    this.utcRedeemedAt = utcRedeemedAt ?? null;
    this.contact = contact ?? {
      fullName: null,
      firstName: null,
      lastName: null,
      emailAddress: null,
      phoneNumber: null,
      locales: [],
      country: null,
      notes: null,
    };
    this.ticket = ticket;
    this.pricing = unitModel.pricingFrom[0];
  }

  public toPOJO = ({
    useCapabilities = false,
    capabilities = [],
  }: CapableToPOJOType): UnitItem => {
    const {
      uuid,
      resellerReference,
      supplierReference,
      unitModel,
      status,
      utcRedeemedAt,
      contact,
      ticket,
    } = this;
    const pojo: UnitItem = {
      uuid,
      resellerReference,
      supplierReference,
      unit: unitModel.toPOJO({ useCapabilities, capabilities }),
      unitId: unitModel.id,
      status,
      utcRedeemedAt,
      contact,
      ticket,
    };
    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pricing))
    ) {
      pojo.pricing = this.pricing;
    }

    return pojo;
  };

  public updateTicket = (ticket: Ticket): UnitItemModel => {
    this.ticket = ticket;
    return this;
  };

  public static fromPOJO = (unitItem: UnitItem): UnitItemModel => {
    console.log("fromPOJO unit item model");
    return new UnitItemModel({
      uuid: unitItem.uuid,
      resellerReference: unitItem.resellerReference,
      supplierReference: unitItem.supplierReference,
      unitModel: UnitModel.fromPOJO(unitItem.unit),
      status: unitItem.status,
      utcRedeemedAt: unitItem.utcRedeemedAt,
      contact: unitItem.contact,
      ticket: unitItem.ticket,
    });
  };
}
