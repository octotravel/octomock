import {
  Availability,
  Booking,
  CapabilityId,
  Product,
  Supplier,
} from "@octocloud/types";
import { ProductValidator } from "../../validators/backendValidator/Product/ProductValidator";
import { SupplierValidator } from "../../validators/backendValidator/Supplier/SupplierValidator";
import { ApiClient, ApiParams } from "./ApiClient";
import { addDays } from "date-fns";
import { AvailabilityValidator } from "../../validators/backendValidator/Availability/AvailabilityValidator";
import { BookingValidator } from "../../validators/backendValidator/Booking/BookingValidator";

export class OctoFlowValidationService {
  private api = new ApiClient();
  private path = "http://localhost:8787/octo/endpoint";
  private capabilities = [CapabilityId.Pricing, CapabilityId.Content];
  private headers = {
    Authorization: `Bearer fareharbortest`,
    "Octo-Capabilities": `${this.capabilities.map(
      (capability) => `${capability}`
    )}`,
  };

  private supplierValidator = new SupplierValidator();
  private productValidator = new ProductValidator({
    capabilities: this.capabilities,
  });
  private availabilityValidator = new AvailabilityValidator({
    capabilities: this.capabilities,
  });
  private bookingValidator = new BookingValidator({
    capabilities: this.capabilities,
  });
  private params: ApiParams = {
    headers: this.headers,
    url: this.path,
  };

  private validateGetSuppliers = async (): Promise<Supplier[]> => {
    console.log("Validating getSuppliers");
    const suppliers = await this.api.getSuppliers(this.params);
    if (suppliers.result) {
      const suppliersErrors = suppliers.result
        .map((supplier) => {
          return this.supplierValidator.validate(supplier);
        })
        .flat(1);
      if (suppliersErrors.length !== 0) {
        console.log(suppliersErrors);
        throw new Error("Incorrect suppliers");
      }
      return suppliers.result;
    }
  };

  private validateGetSupplier = async (
    supplierId: string
  ): Promise<Supplier> => {
    console.log("Validating getSupplier");
    const supplier = await this.api.getSupplier(
      { id: supplierId },
      this.params
    );
    if (supplier.result) {
      const supplierErrors = this.supplierValidator.validate(supplier.result);
      if (supplierErrors.length !== 0) {
        console.log(supplierErrors);
        throw new Error("Incorrect supplier");
      }
      return supplier.result;
    }
    if (supplier.error) {
      // TODO: check error
    }
  };

  private validateGetProducts = async (): Promise<Product[]> => {
    console.log("Validating getProducts");
    const products = await this.api.getProducts(this.params);
    if (products.result) {
      const productsErrors = products.result
        .map((product) => {
          return this.productValidator.validate(product);
        })
        .flat(1);
      if (productsErrors.length !== 0) {
        console.log(productsErrors);
        throw new Error("Incorrect products");
      }
      return products.result;
    }
  };

  private validateGetProduct = async (productId: string): Promise<Product> => {
    console.log("Validating getProduct");
    const product = await this.api.getProduct({ id: productId }, this.params);
    if (product.result) {
      const productError = this.productValidator.validate(product.result);
      if (productError.length !== 0) {
        console.log(productError);
        throw new Error("Incorrect product");
      }
      return product.result;
    }
    if (product.error) {
      // TODO: check error
    }
  };

  private validateGetAvailability = async (
    productId: string,
    optionId: string
  ): Promise<Availability[]> => {
    console.log("Validating availability");
    const availabilities = await this.api.getAvailability(
      {
        productId,
        optionId,
        localDateStart: new Date().toISOString().split("T")[0],
        localDateEnd: addDays(new Date(), 30).toISOString().split("T")[0],
      },
      this.params
    );
    if (availabilities.result) {
      const availabilityErrors = availabilities.result
        .map((availability) => {
          return this.availabilityValidator.validate(availability);
        })
        .flat(1);
      if (availabilityErrors.length !== 0) {
        console.log(availabilityErrors);
        throw new Error("Incorrect availability");
      }
      return availabilities.result;
    }
    if (availabilities.error) {
      // TODO: check error
    }
  };

  private validateCreateBooking = async (
    product: Product,
    availabilityId: string
  ): Promise<Booking> => {
    console.log("Validating create booking");
    const booking = await this.api.bookingReservation(
      {
        productId: product.id,
        optionId: product.options[0].id,
        availabilityId,
        unitItems: [
          { unitId: product.options[0].units[0].id },
          { unitId: product.options[0].units[0].id },
        ],
      },
      this.params
    );
    if (booking.result) {
      const bookingError = this.bookingValidator.validate(booking.result);
      if (bookingError.length !== 0) {
        console.log(bookingError);
        throw new Error("Incorrect booking");
      }
      return booking.result;
    }
    if (booking.error) {
      // TODO: check error
    }
  };

  private validateConfirmBooking = async (
    uuid: string,
    product: Product
  ): Promise<Booking> => {
    console.log("Validating confirm booking");
    const booking = await this.api.bookingConfirmation(
      {
        uuid,
        unitItems: [
          { unitId: product.options[0].units[0].id },
          { unitId: product.options[0].units[0].id },
        ],
      },
      this.params
    );
    if (booking.result) {
      const bookingError = this.bookingValidator.validate(booking.result);
      if (bookingError.length !== 0) {
        console.log(bookingError);
        throw new Error("Incorrect booking");
      }
      return booking.result;
    }
    if (booking.error) {
      // TODO: check error
    }
  };

  private validateCancelBooking = async (uuid: string): Promise<Booking> => {
    console.log("Validating cancel booking");
    const booking = await this.api.cancelBooking({ uuid }, this.params);
    if (booking.result) {
      const bookingError = this.bookingValidator.validate(booking.result);
      if (bookingError.length !== 0) {
        console.log(bookingError);
        throw new Error("Incorrect booking");
      }
      return booking.result;
    }
    if (booking.error) {
      // TODO: check error
    }
  };

  public validateComplexFlow = async (): Promise<void> => {
    const suppliers = await this.validateGetSuppliers();

    const supplier = await this.validateGetSupplier(suppliers[0].id);
    console.log(`Validated: ${supplier.name}`);

    const products = await this.validateGetProducts();

    const product = await this.validateGetProduct(products[0].id);

    const availabilities = await this.validateGetAvailability(
      product.id,
      product.options[0].id
    );

    const bookingCreate = await this.validateCreateBooking(
      product,
      availabilities[0].id
    );

    const bookingConfirm = await this.validateConfirmBooking(
      bookingCreate.uuid,
      product
    );

    const bookingCancel = await this.validateCancelBooking(bookingConfirm.uuid);

    console.log(bookingCancel);
    console.log("done");
  };
}
