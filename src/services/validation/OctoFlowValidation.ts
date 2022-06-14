import { CapabilityId } from "@octocloud/types";
import { ProductValidator } from "../../validators/backendValidator/Product/ProductValidator";
import { SupplierValidator } from "../../validators/backendValidator/Supplier/SupplierValidator";
import { ApiClient, ApiParams } from "./ApiClient";
import { addDays } from "date-fns";
import { AvailabilityValidator } from "../../validators/backendValidator/Availability/AvailabilityValidator";
import { BookingValidator } from "../../validators/backendValidator/Booking/BookingValidator";


export class OctoFlowValidationService {
  private api = new ApiClient();
  private path = "http://localhost:8787/octo/endpoint";
  private headers = {
    "Authorization": `Bearer fareharbortest`,
    "Octo-Capabilities": "octo/content,octo/pricing",
  };
  private capabilities = [CapabilityId.Pricing, CapabilityId.Content];

  private supplierValidator = new SupplierValidator();
  private productValidator = new ProductValidator({capabilities: this.capabilities});
  private availabilityValidator = new AvailabilityValidator({capabilities: this.capabilities});
  private bookingValidator = new BookingValidator({capabilities: this.capabilities});

  public validateFlow = async (): Promise<void> => {
    const params: ApiParams = {
      capabilities: this.capabilities,
      headers: this.headers,
      url: this.path,
    };

    console.log('Validating getSuppliers')
    const suppliers = (await this.api.getSuppliers(params)).result;
    const suppliersErrors = suppliers.map(supplier => {
      return this.supplierValidator.validate(supplier);
    }).flat(1);
    if (suppliersErrors.length !== 0) {
      console.log(suppliersErrors);
      throw new Error('Incorrect suppliers');
    }

    console.log('Validating getSupplier')
    const supplier = (await this.api.getSupplier({id: suppliers[0].id}, params)).result;
    const supplierErrors = this.supplierValidator.validate(supplier);
    if (supplierErrors.length !== 0) {
      console.log(supplierErrors);
      throw new Error('Incorrect supplier');
    }

    console.log('Validating getProducts')
    const products = (await this.api.getProducts(params)).result;
    const productsErrors = products.map(product => {
      return this.productValidator.validate(product);
    }).flat(1);
    if (productsErrors.length !== 0) {
      console.log(productsErrors);
      throw new Error('Incorrect products');
    }

    console.log('Validating getProduct')
    const product = (await this.api.getProduct({id: products[0].id}, params)).result;
    const productError = this.productValidator.validate(product);
    if (productError.length !== 0) {
      console.log(productError);
      throw new Error('Incorrect product');
    }

    console.log('Validating availability')
    const availabilities = (await this.api.getAvailability({productId: product.id, optionId: product.options[0].id, localDateStart: new Date().toISOString().split('T')[0], localDateEnd: addDays(new Date(), 30).toISOString().split('T')[0]}, params)).result;
    const availabilityErrors = availabilities.map(availability => {
      return this.availabilityValidator.validate(availability)
    }).flat(1);
      
    if (availabilityErrors.length !== 0) {
      console.log(availabilityErrors);
      throw new Error('Incorrect availability');
    }

    console.log('Validating create booking')
    const bookingCreate = (await this.api.bookingReservation({productId: product.id, optionId: product.options[0].id, availabilityId: availabilities[0].id, unitItems: [{unitId: product.options[0].units[0].id},{unitId: product.options[0].units[0].id}]}, params)).result;
    
    console.log(bookingCreate.unitItems[0])
    
    const bookingCreateError = this.bookingValidator.validate(bookingCreate);
    if (bookingCreateError.length !== 0) {
      console.log(bookingCreateError);
      throw new Error('Incorrect booking');
    }

    console.log('done')

  };
}
