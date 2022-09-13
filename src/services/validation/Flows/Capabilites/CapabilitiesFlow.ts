import { ApiClient } from "../../api/ApiClient";
import { Flow, FlowResult } from "../Flow";
import { GetCapabilitiesScenario } from "../../Scenarios/Capabilities/GetCapabilities";
import { Config } from "../../config/Config";
import { BaseFlow } from "../BaseFlow";

export class CapabilitiesFlow extends BaseFlow implements Flow {
  private config = Config.getInstance();
  private apiClient: ApiClient;
  constructor() {
    super("Get Capabilities");
    this.apiClient = new ApiClient({
      url: this.config.getEndpointData().endpoint,
      apiKey: this.config.getEndpointData().apiKey,
    });
  }

  public validate = async (): Promise<FlowResult> => {
    const scenario = await this.validateGetCapabilities();
    const result = await scenario.validate();

    return this.getFlowResult([result]);
  };

  private validateGetCapabilities =
    async (): Promise<GetCapabilitiesScenario> => {
      return new GetCapabilitiesScenario({
        apiClient: this.apiClient,
      });
    };
}
