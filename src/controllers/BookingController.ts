import { Booking, BookingStatus, BookingUnitItemSchema, CapabilityId } from "@octocloud/types";
import { UnprocessableEntityError } from "../models/Error";
import {
  CancelBookingSchema,
  ConfirmBookingSchema,
  CreateBookingSchema,
  ExtendBookingSchema,
  GetBookingSchema,
  GetBookingsSchema,
  UpdateBookingSchema,
} from "../schemas/Booking";
import { AvailabilityService } from "../services/AvailabilityService";
import { BookingService } from "../services/BookingService";
import * as R from "ramda";
import { BookingModel, BookingParser, OptionModel } from "@octocloud/generators";
import { BookingRepository } from "../repositories/BookingRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { ContactMapper } from "../helpers/ContactHelper";
import OrderRepository from "../repositories/OrderRepository";
import { OrderModelFactory } from "../factories/OrderModelFactory";
import { BookingCartModel } from "@octocloud/generators/dist/models/booking/BookingCartModel";
import InvalidOrderIdError from "../errors/InvalidOrderIdError";

interface IBookingController {
  createBooking(schema: CreateBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  confirmBooking(schema: ConfirmBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  updateBooking(schema: UpdateBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  extendBooking(schema: ExtendBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  cancelBooking(schema: CancelBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  getBooking(schema: GetBookingSchema, capabilities: CapabilityId[]): Promise<Booking>;
  getBookings(schema: GetBookingsSchema, capabilities: CapabilityId[]): Promise<Booking[]>;
}

export class BookingController implements IBookingController {
  private readonly bookingRepository = new BookingRepository();
  private readonly productRepository = new ProductRepository();
  private readonly orderRepository = new OrderRepository();
  private readonly bookingService = new BookingService();
  private readonly availabilityService = new AvailabilityService();
  private readonly bookingParser = new BookingParser();

  public createBooking = async (schema: CreateBookingSchema, capabilities: CapabilityId[]): Promise<Booking> => {
    const productWithAvailabilityModel = this.productRepository.getProductWithAvailability(schema.productId);
    const availabilityModel = await this.availabilityService.findBookingAvailability(
      {
        productWithAvailabilityModel: productWithAvailabilityModel,
        optionId: schema.optionId,
        availabilityId: schema.availabilityId,
      },
      capabilities
    );
    const bookingModel = await this.bookingService.createBookingModel(
      schema,
      productWithAvailabilityModel,
      availabilityModel
    );
    this.checkRestrictions(bookingModel.optionModel, schema.unitItems);

    if (capabilities.includes(CapabilityId.Cart)) {
      let orderModel;
      let primary;

      if (schema.orderId === undefined) {
        orderModel = OrderModelFactory.createByBooking(bookingModel, schema);
        await this.orderRepository.createOrder(orderModel);
        primary = true;
      } else {
        orderModel = await this.orderRepository.getOrderById(schema.orderId);

        if (orderModel === null) {
          throw new InvalidOrderIdError(schema.orderId);
        }

        orderModel.bookingModels = [...orderModel.bookingModels, bookingModel];
        await this.orderRepository.updateOrder(orderModel);
        primary = false;
      }

      const bookingCartModel = new BookingCartModel({
        orderId: orderModel.id,
        primary: primary,
      });

      bookingModel.bookingCartModel = bookingCartModel;
    }

    await this.bookingRepository.createBooking(bookingModel);

    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities);
  };

  public confirmBooking = async (schema: ConfirmBookingSchema, capabilities: CapabilityId[]): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(schema);

    if (bookingModel.status === BookingStatus.CONFIRMED) {
      return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities);
    }
    this.checkRestrictions(bookingModel.optionModel, schema.unitItems);

    const updatedBookingModel = this.bookingService.confirmBookingBySchema(bookingModel, schema);
    await this.bookingRepository.updateBooking(updatedBookingModel);

    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(updatedBookingModel, capabilities);
  };

  public updateBooking = async (schema: UpdateBookingSchema, capabilities: CapabilityId[]): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(schema);

    if (bookingModel.cancellable === false) {
      throw new UnprocessableEntityError("booking cannot be updated");
    }

    let updatedBookingModel: BookingModel;

    if (schema.availabilityId || (schema.productId && schema.optionId && schema.availabilityId && schema.unitItems)) {
      const remappedUnitItems = bookingModel.unitItemModels.map((unitItemModel) => ({
        uuid: unitItemModel.uuid,
        unitId: unitItemModel.unitModel.id,
        resellerReference: unitItemModel.resellerReference ?? undefined,
        contact: ContactMapper.remapContactToBookingContactSchema(unitItemModel.contact),
      }));
      const createBookingSchema: CreateBookingSchema = {
        ...schema,
        productId: schema.productId ?? bookingModel.productModel.id,
        optionId: schema.optionId ?? bookingModel.optionModel.id,
        availabilityId: schema.availabilityId,
        unitItems: schema.unitItems ?? remappedUnitItems,
      };
      const productWithAvailabilityModel = this.productRepository.getProductWithAvailability(
        createBookingSchema.productId
      );
      const availabilityModel = await this.availabilityService.findBookingAvailability(
        {
          productWithAvailabilityModel: productWithAvailabilityModel,
          optionId: createBookingSchema.optionId,
          availabilityId: createBookingSchema.availabilityId,
        },
        capabilities
      );
      const rebookedBookingModel = await this.bookingService.createBookingModel(
        createBookingSchema,
        productWithAvailabilityModel,
        availabilityModel
      );

      updatedBookingModel = this.bookingService.updateBookingBySchema(bookingModel, schema, rebookedBookingModel);
      await this.bookingRepository.updateBooking(updatedBookingModel);
    } else {
      this.checkRestrictions(bookingModel.optionModel, schema.unitItems);

      updatedBookingModel = this.bookingService.updateBookingBySchema(bookingModel, schema);
      await this.bookingRepository.updateBooking(updatedBookingModel);
    }

    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(updatedBookingModel, capabilities);
  };

  public extendBooking = async (
    extendBookingSchema: ExtendBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(extendBookingSchema);
    if (bookingModel.status !== BookingStatus.ON_HOLD) {
      throw new UnprocessableEntityError("booking cannot be extended");
    }

    const extendedBookingModel = this.bookingService.extendBookingBySchema(bookingModel, extendBookingSchema);
    await this.bookingRepository.updateBooking(extendedBookingModel);
    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities);
  };

  public cancelBooking = async (
    cancelBookingSchema: CancelBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(cancelBookingSchema);

    if (bookingModel.cancellable === false) {
      throw new UnprocessableEntityError("Booking cannot be cancelled");
    }

    if (bookingModel.status === BookingStatus.CANCELLED) {
      return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities);
    }

    const cancelledBooking = this.bookingService.cancelBookingBySchema(bookingModel, cancelBookingSchema);
    await this.bookingRepository.updateBooking(cancelledBooking);

    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(cancelledBooking, capabilities);
  };

  public getBooking = async (schema: GetBookingSchema, capabilities: CapabilityId[]): Promise<Booking> => {
    const bookingModel = await this.bookingRepository.getBooking(schema);
    return this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities);
  };

  public getBookings = async (schema: GetBookingsSchema, capabilities: CapabilityId[]): Promise<Booking[]> => {
    const bookingModels = await this.bookingRepository.getBookings(schema);
    return bookingModels.map((bookingModel) =>
      this.bookingParser.parseModelToPOJOWithSpecificCapabilities(bookingModel, capabilities)
    );
  };

  private checkRestrictions = (optionModel: OptionModel, unitItems?: BookingUnitItemSchema[]): void => {
    if (R.isEmpty(unitItems)) {
      throw new UnprocessableEntityError("Validation failed: Tickets at least one ticket is required");
    }

    const minUnits = optionModel.restrictions.minUnits;
    if (unitItems !== undefined && minUnits > unitItems.length) {
      throw new UnprocessableEntityError("minimal restrictions not met");
    }

    const maxUnits = optionModel.restrictions.maxUnits;
    if (unitItems !== undefined && maxUnits !== null && maxUnits < unitItems.length) {
      throw new UnprocessableEntityError("maximal restrictions not met");
    }
  };
}
