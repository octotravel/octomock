import { Scenario } from "../Scenario";
import { Config } from "../../config/Config";
import { AvailabilityStatusScenarioHelper } from "../../helpers/AvailabilityStatusScenarioHelper";
import { DateHelper } from "../../../../helpers/DateHelper";
import { addDays } from "date-fns";
import { AvailabilityType } from "@octocloud/types";

export class AvailabilityCheckStatusScenario implements Scenario<any> {
  private config = Config.getInstance();
  private apiClient = this.config.getApiClient();
  private availabilityStatusScenarioHelper =
    new AvailabilityStatusScenarioHelper();

  public validate = async () => {
    const name = `Availability Check Status`;
    const startTimesProducts = this.config.getProducts(
      AvailabilityType.START_TIME
    );
    const openingHoursProducst = this.config.getProducts(
      AvailabilityType.OPENING_HOURS
    );

    const startTimes = await Promise.all(
      startTimesProducts.map(async (product) => {
        const optionId =
          product.options.find((option) => option.default).id ??
          product.options[0].id;
        const result = await this.apiClient.getAvailability({
          productId: product.id,
          optionId,
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
        const optionId =
          product.options.find((option) => option.default).id ??
          product.options[0].id;
        const result = await this.apiClient.getAvailability({
          productId: product.id,
          optionId,
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
