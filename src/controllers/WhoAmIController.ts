import { Context } from 'koa';
import { BadRequestError } from 'models/Error';
import { ConnectionRepository } from 'repositories/ConnectionRepository';
import { ResellerRepository } from 'repositories/ResellerRepository';
import { SupplierRepository } from 'repositories/SupplierRepository';
import { WhoAmIAggregate } from 'types/WhoAmIAggregate';

interface IWhoAmIController {
  get: (ctx: Context) => Promise<void>;
}

export class WhoAmIController implements IWhoAmIController {
  private readonly resellerRepository = new ResellerRepository();
  private readonly supplierRepository = new SupplierRepository();
  private readonly connectionRepository = new ConnectionRepository();

  public get = async (ctx: Context): Promise<void> => {
    try {
      const authHeader = ctx.request.headers.authorization;

      if (!authHeader) {
        throw new BadRequestError('Authorization header is missing');
      }

      const apiKey = authHeader.replace('Bearer ', '');
      const supId = '1';
      const connectionId = '1';

      const reseller = this.resellerRepository.getReseller(apiKey);
      const supplier = this.supplierRepository.getSupplier(supId);
      const connection = this.connectionRepository.getConnection(connectionId);

      const response: WhoAmIAggregate = {
        reseller,
        supplier,
        connection,
        checkout: null,
        operator: null,
        partner: null,
        terminal: null,
      };

      ctx.status = 200;
      ctx.body = response;
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: <>
      throw error;
    }
  };
}
