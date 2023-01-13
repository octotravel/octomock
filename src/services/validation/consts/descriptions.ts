const invalidProduct =
  "This test checks that INVALID_PRODUCT_ID response is returned for invalid optionId in request body";
const invalidOption =
  "This test checks that INVALID_OPTION_ID response is returned for invalid optionId in request body";
const invalidUUID =
  "This test checks that INVALID_UUID_ID response is returned for invalid uuid in request body";
const invalidUnitId =
  "This test checks that INVALID_UNIT_ID response is returned for invalid unitId in request body";

const getCapabilities = "This test checks that returned capabilities are correct";

const getSupplier = "This test checks that returned supplier object has the correct fields";

const getProduct =
  "This test checks that returned product object has the correct fields and capabilities";
const getProducts =
  "This test checks returned array of products if it has the correct fields and capabilities";

const availabilityCheckAvailabilityId =
  "This test checks that correct availability was returned with matching availabilityId as the request";
const availabilityCheckBadRequest =
  "This test checks that BAD_REQUEST response is returned if there is invalid combination of request parameters";
const availabilityCheckDate =
  "This test checks that correct availability is returned for specific date";
const availabilityCheckInterval =
  "This test checks returned array of availabilities for 30 days from now";
const availabilityCheckStatus =
  "This test checks if availability endpoint is working correctly and there are useable availabilities";

const availabilityCalendarBadRequest =
  "This test checks that BAD_REQUEST response is returned if there is invalid or missing date in request body";
const availabilityCalendarInterval =
  "This test checks returned array of availabilities for 30 days from now";

const bookingCancellationBooking = "This test checks that booking is correctly cancelled";
const bookingCancellationReservation = "This test checks that reservation is correctly cancelled";

const bookingConfirmation = "This test checks that reservation is correctly confirmed";
const bookingConfirmationUnitItemsUpdate =
  "This test checks that unit items on bookign are updated according to request body";

const bookingReservationExtend = "This test checks that reservation is extended correctly";

const bookingGetBooking = "This test checks that correct booking is returned";
const bookingGetReservation = "This test checks that correct reservation is returned";

const bookingListResellerReference =
  "This test checks that correct bookings with provided reseller reference are returned";
const bookingListSupplierReference =
  "This test checks that correct bookings with provided supplier reference are returned";
const bookingListBadRequest =
  "This test checks that BAD_REQUEST response is returned if the request body is empty";

const bookingReservationEmptyUnitItems =
  "This test checks that UNPROCESSABLE_ENTITY response is returned for empty unitItems in request body";
const bookingReservationInvalidAvailabilityId =
  "This test checks that INVALID_AVAILABILITY_ID response is returned for invalid availabilityId in request body";
const bookingReservationMissingUnitItems =
  "This test checks that UNPROCESSABLE_ENTITY response is returned for not providing unitItems in request body";
const bookingReservation = "This test checks that booking reservation is done correctly";
const bookingReservationSoldOut =
  "This test checks that UNPROCESSABLE_ENTITY response is returned for availability that has status SOLD_OUT";

const bookingUpdateContact =
  "This test checks that contact on booking was updated according to request body";
const bookingUpdateDate =
  "This test checks that date on booking was updated according to request body";
const bookingUpdateProduct =
  "This test checks that product on booking was updated according to request body";
const bookingUpdateUnitItems =
  "This test checks that unit items on booking were updated according to request body";

const descriptions = {
  invalidProduct,
  invalidOption,
  invalidUUID,
  invalidUnitId,
  getCapabilities,
  getSupplier,
  getProduct,
  getProducts,
  availabilityCheckAvailabilityId,
  availabilityCheckBadRequest,
  availabilityCheckDate,
  availabilityCheckInterval,
  availabilityCheckStatus,
  availabilityCalendarBadRequest,
  availabilityCalendarInterval,
  bookingCancellationBooking,
  bookingCancellationReservation,
  bookingConfirmation,
  bookingConfirmationUnitItemsUpdate,
  bookingReservationExtend,
  bookingGetBooking,
  bookingGetReservation,
  bookingListResellerReference,
  bookingListSupplierReference,
  bookingReservationEmptyUnitItems,
  bookingReservationInvalidAvailabilityId,
  bookingReservationMissingUnitItems,
  bookingReservation,
  bookingReservationSoldOut,
  bookingListBadRequest,
  bookingUpdateContact,
  bookingUpdateDate,
  bookingUpdateProduct,
  bookingUpdateUnitItems,
};

export default descriptions;
