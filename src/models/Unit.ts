import { UnitContentModel } from "./UnitContent";
import { Unit, UnitId, Restrictions } from "../types/Unit";
import { Pricing } from "../types/Pricing";

export class UnitModel {
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

  public toPOJO = (): Unit => {
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

    Object.keys(this.unitContentModel).forEach((key) => {
      pojo[key] = this.unitContentModel[key];
    });

    pojo.pricingFrom = this.pricingFrom;

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
