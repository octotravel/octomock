import { CapabilityId, Supplier } from "@octocloud/types";
import { ApiClient, ApiParams } from "./ApiClient";

type Result<T> = {
  result: Nullable<T>;
  error: Nullable<Error>;
};
export class OctoFlowValidationService {
  private api = new ApiClient();
  private path = "http://localhost:8787/octo/endpoint";
  private headers = {
    Authorization: `Bearer fareharbortest`,
  };
  private capabilities = [CapabilityId.Pricing, CapabilityId.Content];

  private getSuppliers = async (
    params: ApiParams
  ): Promise<Result<Supplier>> => {
    const response = await this.api.getSuppliers(params);
    if (response.status === 200) {
      return {
        result: await response.json(),
        error: null,
      };
    }
    return {
      result: null,
      error: await response.json(),
    };
  };

  public validateFlow = async (): Promise<void> => {
    const suppliers = await this.getSuppliers({
      capabilities: this.capabilities,
      headers: this.headers,
      url: this.path,
    });
    console.log("suppliers", suppliers);
  };
}
