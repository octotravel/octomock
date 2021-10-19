import { CreateBookingSchema } from "../schemas/Booking";
import { DB } from "../storage/Database";
import { Booking } from "../types/Booking";
import { CapabilityId } from "../types/Capability";

interface IBookingService {
  createBooking(
    data: CreateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking>;
}

export class BookingService implements IBookingService {
  public createBooking = async (
    data: CreateBookingSchema,
    capabilities: CapabilityId[]
  ): Promise<Booking> => {
    const db = DB.getInstance().getDB();

    // TODO: build booking model
    console.log(data, capabilities);

    await db.run(
      `
      INSERT INTO booking (
        id,
        resellerReference,
        supplierReference,
        data
      ) VALUES (?, ?, ?, ?)
    `,
      "123",
      null,
      undefined,
      JSON.stringify({ x: 1 })
    );

    console.log("data inserted");

    const result = await db.all(`SELECT * FROM booking`);
    console.log(JSON.stringify(result));
    console.log(result);
    return {} as Booking;
  };
}
