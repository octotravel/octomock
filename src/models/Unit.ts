import { CapabilityId } from "./../types/Capability";
import { CapableToPOJOType } from "./../interfaces/Capable";
import { UnitContentModel } from "./UnitContent";
import { Unit, UnitId, Restrictions } from "../types/Unit";
import { Pricing } from "../types/Pricing";
import { Capable } from "../interfaces/Capable";

export class UnitModel implements Capable {
  public id: UnitId;
  private internalName: string;
  private reference: string;
  private type: string;
  private requiredContactFields: string[];
  private restrictions: Restrictions;
  // content
  private unitContentModel: UnitContentModel;
  // pricing
  private pricingFrom: Array<Pricing> = [];
  private onBooking: boolean;

  constructor({
    id,
    restrictions,
    pricing,
  }: {
    id: UnitId;
    restrictions: Restrictions;
    pricing: Pricing[];
  }) {
    this.id = id;
    this.internalName = id;
    this.reference = id.toLowerCase();
    this.type = id.toUpperCase();
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
        pojo.pricing = this.pricingFrom;
      } else {
        pojo.pricingFrom = this.pricingFrom;
      }
    }

    return pojo;
  };

  public static fromPOJO = (unit: Unit): UnitModel => {
    return new UnitModel({
      id: unit.id,
      restrictions: unit.restrictions,
      pricing: unit.pricing,
    });
  };
}
