import { Supplier } from '@octocloud/types';
import { Connection } from 'inteface/Connection';
import { Reseller } from 'types/Reseller';

export interface WhoAmIAggregate {
  supplier: Nullable<Supplier>;
  connection: Connection;
  reseller: Reseller;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  partner: Record<string, any> | null;
  checkout: string | null;
  operator: string | null;
  terminal: string | null;
}
