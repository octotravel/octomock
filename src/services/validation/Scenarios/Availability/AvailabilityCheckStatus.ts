import { Scenario } from "../Scenario";
import { Config } from "../../config/Config";
import { AvailabilityStatusScenarioHelper } from "../../helpers/AvailabilityStatusScenarioHelper";
import { DateHelper } from "../../../../helpers/DateHelper";
import { addDays } from "date-fns";

export class AvailabilityCheckStatusScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityStatusScenarioHelper =
    new AvailabilityStatusScenarioHelper();

  public validate = async () => {
    const name = `Availability Check Status`;
    const startTimesProducts = this.config.getStartTimeProducts().products;
    const openingHoursProducst = this.config.getOpeningHoursProducts().products;

    const startTimes = await Promise.all(
      startTimesProducts.map(async (product) => {
        const result = await this.apiClient.getAvailability({
          productId: product.id,
          optionId: product.options[0].id,
          localDateStart: DateHelper.getDate(new Date().toISOString()),
          localDateEnd: DateHelper.getDate(
            addDays(new Date(), 30).toISOString()
          ),
        });
        return {
          result,
          product,
        };
      })
    );

    const openingHours = await Promise.all(
      openingHoursProducst.map(async (product) => {
        const result = await this.apiClient.getAvailability({
          productId: product.id,
          optionId: product.options[0].id,
          localDateStart: DateHelper.getDate(new Date().toISOString()),
          localDateEnd: DateHelper.getDate(
            addDays(new Date(), 30).toISOString()
          ),
        });
        return {
          result,
          product,
        };
      })
    );

    return this.availabilityStatusScenarioHelper.validateAvailability({
      name,
      startTimes,
      openingHours,
    });
  };
}
