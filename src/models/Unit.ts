import * as R from "ramda";
import {
  CapabilityId,
  Unit,
  Restrictions,
  Pricing,
  UnitType,
} from "@octocloud/types";
import { CapableToPOJOType } from "./../interfaces/Capable";
import { UnitContentModel } from "./UnitContent";
import { Capable } from "../interfaces/Capable";

export class UnitModel implements Capable {
  public id: string;
  private internalName: string;
  private reference: string;
  private type: UnitType;
  private requiredContactFields: string[];
  private restrictions: Restrictions;
  // content
  private unitContentModel: UnitContentModel;
  // pricing
  public pricingFrom: Array<Pricing> = [];
  private onBooking: boolean;

  constructor({
    id,
    type,
    restrictions,
    pricing,
  }: {
    id: string;
    type: UnitType;
    restrictions: Restrictions;
    pricing: Pricing[];
  }) {
    this.id = id;
    this.internalName = id;
    this.reference = id.toLowerCase();
    this.type = type;
    this.requiredContactFields = [];
    this.restrictions = restrictions;
    this.unitContentModel = new UnitContentModel(this.id);
    this.pricingFrom = pricing;
  }

  public setOnBooking = (): UnitModel => {
    this.onBooking = true;
    return this;
  };

  public toPOJO = ({
    useCapabilities = false,
    capabilities = [],
  }: CapableToPOJOType): Unit => {
    const {
      id,
      internalName,
      reference,
      type,
      requiredContactFields,
      restrictions,
    } = this;
    const pojo: Unit = {
      id,
      internalName,
      reference,
      type,
      requiredContactFields,
      restrictions,
    };

    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Content))
    ) {
      Object.keys(this.unitContentModel).forEach((key) => {
        pojo[key] = this.unitContentModel[key];
      });
    }
    if (
      useCapabilities === false ||
      (useCapabilities === true && capabilities.includes(CapabilityId.Pricing))
    ) {
      if (this.onBooking) {
        if (R.not(R.isEmpty(this.pricingFrom))) {
          pojo.pricing = this.pricingFrom;
        }
      } else {
        pojo.pricingFrom = this.pricingFrom;
      }
    }

    return pojo;
  };

  public static fromPOJO = (unit: Unit): UnitModel => {
    return new UnitModel({
      id: unit.id,
      type: unit.type,
      restrictions: unit.restrictions,
      pricing: unit.pricing ?? unit.pricingFrom,
    });
  };
}
