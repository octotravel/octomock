import { pricingEUR } from "./../data/Pricing";
import { Currency } from "./../types/Currency";
import { CapabilityId } from "../types/Capability";
import { Unit, UnitId, Restrictions } from "../types/Unit";
import { Pricing } from "../types/Pricing";

export class UnitModel {
  private id: UnitId;
  private internalName: string;
  private reference: string;
  private type: string;
  private restrictions: Restrictions;
  // content
  private title: string;
  private titlePlural: string;
  private subtitle: string;
  // pricing
  private pricingFrom: Array<Pricing> = [];

  private capabilities: CapabilityId[] = [];

  constructor({
    id,
    restrictions,
  }: {
    id: UnitId;
    restrictions: Restrictions;
  }) {
    this.id = id;
    this.internalName = id;
    this.reference = id.toLowerCase();
    this.type = id.toUpperCase();
    this.restrictions = restrictions;
  }

  public addContent = (): UnitModel => {
    this.capabilities.push(CapabilityId.Content);
    this.title = this.id;
    this.titlePlural = `${this.title}s`;
    this.subtitle = `${this.title}'s subtitle`;
    return this;
  };

  public addPricing = (currency: Currency): UnitModel => {
    this.capabilities.push(CapabilityId.Pricing);
    if (currency === Currency.EUR) {
      this.pricingFrom = [pricingEUR];
    }
    return this;
  };

  public toPOJO = (): Unit => {
    const { id, internalName, reference, type, restrictions } = this;
    const pojo: Unit = {
      id,
      internalName,
      reference,
      type,
      restrictions,
    };

    if (this.capabilities.includes(CapabilityId.Content)) {
      pojo.title = this.title;
      pojo.titlePlural = this.titlePlural;
      pojo.subtitle = this.subtitle;
    }

    if (this.capabilities.includes(CapabilityId.Pricing)) {
      pojo.pricingFrom = this.pricingFrom;
    }

    return pojo;
  };
}
