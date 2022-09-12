import { ValidationEndpoint } from "../../../schemas/Validation";
import { PreConfig } from "./PreConfig";

// interface GetProductsData {
//   apiClient: ApiClient;
//   products: Product[];
//   availabilityRequired: boolean;
//   availabilityType?: AvailabilityType;
// }

export class EndpointParser {
  public parse = async (data: ValidationEndpoint): Promise<PreConfig> => {
    return new PreConfig({
      endpoint: data.backend.endpoint,
      apiKey: data.backend.apiKey,
      backendType: data.backend.type,
    });
  };

  // private getAvailabilities = async (
  //   apiClient: ApiClient,
  //   products: Product[],
  //   availabilityStatus: AvailabilityStatus
  // ) => {
  //   for await (const product of products) {
  //     const defaultOption = product.options.find((option) => option.default);
  //     if (!defaultOption) {
  //       throw new BadRequestError("Atleast one option must be default");
  //     }
  //     const availability = (
  //       await apiClient.getAvailability({
  //         productId: product.id,
  //         optionId: defaultOption.id,
  //         localDateStart: DateHelper.getDate(new Date().toISOString()),
  //         localDateEnd: DateHelper.getDate(
  //           addDays(new Date(), 30).toISOString()
  //         ),
  //       })
  //     ).response.data.body;

  //     const selectedAvailability = availability.find(
  //       (availability) => availability.status === availabilityStatus
  //     );
  //     if (selectedAvailability) {
  //       return {
  //         productId: product.id,
  //         optionId: defaultOption.id,
  //         availabilityId: selectedAvailability.id,
  //       };
  //     }
  //   }
  // };

  // private getProducts = async (data: GetProductsData) => {
  //   if (data.availabilityRequired) {
  //     const filteredProducts = data.products.filter(
  //       (product) => product.availabilityType === data.availabilityType
  //     );
  //     const availabilityAvailable = await this.getAvailabilities(
  //       data.apiClient,
  //       filteredProducts,
  //       AvailabilityStatus.AVAILABLE
  //     );

  //     const availabilitySoldOut = await this.getAvailabilities(
  //       data.apiClient,
  //       filteredProducts,
  //       AvailabilityStatus.SOLD_OUT
  //     );

  //     return {
  //       products: filteredProducts,
  //       availabilityAvailable,
  //       availabilitySoldOut,
  //     };
  //   } else {
  //     const filteredProducts = data.products.filter(
  //       (product) => !product.availabilityRequired
  //     );
  //     const availabilityAvailable = await this.getAvailabilities(
  //       data.apiClient,
  //       filteredProducts,
  //       AvailabilityStatus.AVAILABLE
  //     );

  //     const availabilitySoldOut = await this.getAvailabilities(
  //       data.apiClient,
  //       filteredProducts,
  //       AvailabilityStatus.SOLD_OUT
  //     );

  //     return {
  //       products: filteredProducts,
  //       availabilityAvailable,
  //       availabilitySoldOut,
  //     };
  //   }
  // };

  // public fetch = async (
  //   data: PreConfig,
  //   capabilitiesFlow: FlowResult
  // ): Promise<Config> => {
  //   const capabilities = capabilitiesFlow.scenarios[0].response.body.map(
  //     (capability: Capability) => {
  //       if (capability.id) {
  //         return capability.id;
  //       }
  //     }
  //   );

  //   const apiClient = new ApiClient({
  //     capabilities,
  //     url: data.url,
  //     apiKey: data.apiKey,
  //   });

  //   const products = (await apiClient.getProducts()).response;
  //   if (products.error) {
  //     throw new BadRequestError("Invalid products");
  //   }

  //   const startTimesProducts = await this.getProducts({
  //     apiClient,
  //     products: products.data.body,
  //     availabilityType: AvailabilityType.START_TIME,
  //     availabilityRequired: true,
  //   });

  //   const openingHoursProducts = await this.getProducts({
  //     apiClient,
  //     products: products.data.body,
  //     availabilityType: AvailabilityType.START_TIME,
  //     availabilityRequired: true,
  //   });

  //   const availabilityRequiredFalseProducts = await this.getProducts({
  //     apiClient,
  //     products: products.data.body,
  //     availabilityRequired: false,
  //   });

  //   return new Config({
  //     url: data.url,
  //     apiKey: data.apiKey,
  //     capabilities,
  //     startTimesProducts,
  //     openingHoursProducts,
  //     availabilityRequiredFalseProducts,
  //     validProducts:
  //       startTimesProducts.availabilityAvailable !== undefined ||
  //       openingHoursProducts.availabilityAvailable !== undefined ||
  //       availabilityRequiredFalseProducts.availabilityAvailable !== undefined,
  //     ignoreKill: true,
  //   });
  // };
}
