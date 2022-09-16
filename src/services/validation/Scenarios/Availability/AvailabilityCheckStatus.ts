import { Scenario } from "../Scenario";
import { Config } from "../../config/Config";
import { AvailabilityStatusScenarioHelper } from "../../helpers/AvailabilityStatusScenarioHelper";
import { Product } from "@octocloud/types";

export class AvailabilityCheckStatusScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityStatusScenarioHelper =
    new AvailabilityStatusScenarioHelper();

  public validate = async () => {
    const name = `Availability Check Status`;
    const productsStartTime = this.config.productConfig.startTimeProducts;
    const productsOpeningHour = this.config.productConfig.openingHourProducts;

    const startTimes = await this.fetchAvailabilityForProducts(
      productsStartTime
    );
    const openingHours = await this.fetchAvailabilityForProducts(
      productsOpeningHour
    );

    return this.availabilityStatusScenarioHelper.validateAvailability({
      name,
      startTimes,
      openingHours,
    });
  };

  private fetchAvailabilityForProducts = async (products: Product[]) => {
    return Promise.all(
      products.map(async (product) => {
        const option =
          product.options.find((option) => option.default) ??
          product.options[0];
        const result = await this.apiClient.getAvailability({
          productId: product.id,
          optionId: option.id,
          localDateStart: this.config.localDateStart,
          localDateEnd: this.config.localDateEnd,
        });
        return {
          result,
          product,
        };
      })
    );
  };
}
