import { OctoError } from '../models/Error';

export default class OfferConditionsNotMet extends OctoError {
  public constructor() {
    super({
      status: 400,
      error: 'OFFER_CONDITIONS_NOT_MET',
      errorMessage: 'Offer conditions are not met',
    });
  }
}
