import { Pricing } from "./Pricing";

export enum UnitId {
  Adult = "adult",
  Youth = "youth",
  Child = "child",
  Infant = "infant",
  Family = "family",
  Senior = "senior",
  Student = "student",
  Military = "military",
}

export interface Restrictions {
  minAge: number;
  maxAge: number;
  idRequired: boolean;
  minQuantity: Nullable<number>;
  maxQuantity: Nullable<number>;
  paxCount: number;
  accompaniedBy: number[];
}

export interface Unit extends UnitContent, UnitPricing {
  id: UnitId;
  internalName: string;
  reference: string;
  type: Nullable<string>;
  restrictions: Restrictions;
}

interface UnitContent {
  title?: string;
  titlePlural?: string;
  subtitle?: string;
}

interface UnitPricing {
  pricingFrom?: Array<Pricing>;
}
