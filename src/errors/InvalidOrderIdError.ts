import { OctoError } from '../models/Error';

export default class InvalidOrderIdError extends OctoError {
  public readonly id: string;

  public constructor(id: string) {
    super({
      status: 400,
      error: 'INVALID_ORDER_ID',
      errorMessage: 'The orderId was already used, missing or invalid',
      bodyParams: { id },
    });

    this.id = id;
  }
}
