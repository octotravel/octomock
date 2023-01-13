import { Scenario } from "../Scenario";
import { Config } from "../../config/Config";
import { AvailabilityStatusScenarioHelper } from "../../helpers/AvailabilityStatusScenarioHelper";
import { Product } from "@octocloud/types";

export class AvailabilityCheckStatusScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private products: Product[];
  private availabilityStatusScenarioHelper = new AvailabilityStatusScenarioHelper();

  constructor(products: Product[]) {
    this.products = products;
  }

  public validate = async () => {
    const availabilityType = this.products[0].availabilityType;
    const name = `Availability Check Status ${availabilityType}`;
    const products = await this.fetchAvailabilityForProducts(this.products);
    return this.availabilityStatusScenarioHelper.validateAvailability({
      name,
      products,
    });
  };

  private fetchAvailabilityForProducts = async (products: Product[]) => {
    return Promise.all(
      products.map(async (product) => {
        const option = product.options.find((option) => option.default) ?? product.options[0];
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
