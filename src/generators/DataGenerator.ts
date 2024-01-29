import { randomUUID } from 'crypto';

export abstract class DataGenerator {
  public static generateSupplierReference = (): string =>
    Array.from(Array(6), () => Math.floor(Math.random() * 36).toString(36))
      .join('')
      .toUpperCase();

  public static generateUUID = (): string => randomUUID();
}
