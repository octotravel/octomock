import { Availability, CapabilityId, Product, Supplier } from '@octocloud/types';
import got from 'got';
import { AvailabilityCalendarValidator, AvailabilityValidator } from '../validators/backendValidator/AvailabilityValidator';
import { BookingValidator } from '../validators/backendValidator/BookingValidator';
import { ProductValidator } from '../validators/backendValidator/ProductValidator';
import { SupplierValidator } from '../validators/backendValidator/SupplierValidator';

interface IOctoValidationService {
    validate(params: ValidationData): Promise<ValidationResponse>;
}

export enum OctoMethod {
    GetSuppliers = 'GetSuppliers',
    GetSupplier = 'GetSupplier',
    GetProducts = 'GetProducts',
    GetProduct = 'GetProduct',
    AvailabilityCheck = 'AvailabilityCheck',
    AvailabilityCalendar = 'AvailabilityCalendar',
    BookingReservation = 'BookingReservation',
    ListBookings = 'ListBookings',
    BookingConfirmation = 'BookingConfirmation',
    GetBooking = 'GetBooking',
    BookingCancellation = 'BookingCancellation',
    BookingUpdate = 'BookingUpdate',
    ExtendReservation = 'ExtendReservation',
}

export interface ValidationData {
    url: string;
    method: OctoMethod;
}

interface ValidationResponse {
    isValid: boolean;
    body: any;
}
export class OctoValidationService implements IOctoValidationService {
    private config = () => {
        return {
            token: 'fareharbortest',
            supplier: 'bodyglove',
            productId: '183',
            optionId: 'DEFAULT',
            localDate: '2022-06-06',
            localDateStart: '2022-10-13',
            localDateEnd: '2022-10-27',
        }
    }
    private supplierValidator = new SupplierValidator();
    private productValidator = new ProductValidator('', [CapabilityId.Content,CapabilityId.Pricing]);
    private availabilityValidator = new AvailabilityValidator('', [CapabilityId.Content,CapabilityId.Pricing]);
    private availabilityCalendarValidator = new AvailabilityCalendarValidator('', [CapabilityId.Content,CapabilityId.Pricing]);
    private bookingValidator = new BookingValidator([CapabilityId.Content,CapabilityId.Pricing]);

    private validateGetSuppliers = async (params: ValidationData): Promise<ValidationResponse> => {
        const fullUrl = `${params.url}/suppliers`;
        const data: Array<any> = await got.get(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"}}).json();

        const valids: any[] = data.map(supplier => {
            try {
                this.supplierValidator.validate(supplier as Supplier);
                return true
            } catch (e) {
                console.log('invalid supplier', supplier)
                console.log(e)
                return false
            }
        })
        if (valids.every(valid => valid === true)) {
            return {
                isValid: true,
                body: data,
            };
        } else {
            return {
                isValid: false,
                body: data,
            };
        }
    }

    private validateGetSupplier = async (params: ValidationData): Promise<ValidationResponse> => {
        const fullUrl = `${params.url}/suppliers/${this.config().supplier}`;
        const data: any = await got.get(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"}}).json();

        try {
            this.supplierValidator.validate(data as Supplier);
            return {
                isValid: true,
                body: data,
            }
        } catch (e) {
            console.log('invalid supplier', data)
            console.log(e)
            return {
                isValid: false,
                body: data,
            }
        }
    }

    private validateGetProducts = async (params: ValidationData): Promise<ValidationResponse> => {
        const fullUrl = `${params.url}/products`;
        console.log(fullUrl)
        const data: Array<any> = await got.get(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"}}).json();

        const valids: any[] = data.map(product => {
            try {
                this.productValidator.validate(product as Product);
                return true
            } catch (e) {
                console.log('invalid product', product)
                console.log(e)
                return false
            }
        })
        if (valids.every(valid => valid === true)) {
            return {
                isValid: true,
                body: data,
            };
        } else {
            return {
                isValid: false,
                body: data,
            };
        }
    }

    private validateGetProduct = async (params: ValidationData): Promise<ValidationResponse> => {
        const fullUrl = `${params.url}/products/${this.config().productId}`;
        const data: any = await got.get(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"}}).json();

        try {
            this.productValidator.validate(data as Product);
            return {
                isValid: true,
                body: data,
            }
        } catch (e) {
            console.log('invalid product', data)
            console.log(e)
            return {
                isValid: false,
                body: data,
            }
        }
    }

    private validateAvailabilityCheck = async (params: ValidationData): Promise<ValidationResponse> => {
        const fullUrl = `${params.url}/availability`;

        const dataLocalDate: any = await got.post(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"},body:JSON.stringify({
            productId: this.config().productId,
            optionId: this.config().optionId,
            localDate: this.config().localDate,
        })}).json();

        const validsLocalDate: any[] = dataLocalDate.map(availability => {
            try {
                this.availabilityValidator.validate(availability as Availability);
                return true
            } catch (e) {
                console.log('invalid availability', availability)
                console.log(e)
                return false
            }
        })

        const dataLocalDateStartEnd: any = await got.post(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"},body:JSON.stringify({
            productId: this.config().productId,
            optionId: this.config().optionId,
            localDateStart: this.config().localDateStart,
            localDateEnd: this.config().localDateEnd,
        })}).json();

        const validsLocalDateStartEnd: any[] = dataLocalDateStartEnd.map(availability => {
            try {
                this.availabilityValidator.validate(availability as Availability);
                return true
            } catch (e) {
                console.log('invalid availability', availability)
                console.log(e)
                return false
            }
        })

        if (validsLocalDate.every(valid => valid === true) && validsLocalDateStartEnd.every(valid => valid === true)) {
            return {
                isValid: true,
                body: {
                    ...dataLocalDate,
                    ...dataLocalDateStartEnd,
                },
            };
        } else {
            return {
                isValid: false,
                body: {
                    ...dataLocalDate,
                    ...dataLocalDateStartEnd,
                },
            };
        }
    }

    private validateAvailabilityCalendar = async (params: ValidationData): Promise<ValidationResponse> => {
        const fullUrl = `${params.url}/availability/calendar`;

        const data: any = await got.post(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"},body:JSON.stringify({
            productId: this.config().productId,
            optionId: this.config().optionId,
            localDateStart: this.config().localDateStart,
            localDateEnd: this.config().localDateEnd,
        })}).json();

        const valids: any[] = data.map(availability => {
            try {
                this.availabilityCalendarValidator.validate(availability);
                return true
            } catch (e) {
                console.log('invalid availability', availability)
                console.log(e)
                return false
            }
        })

        if (valids.every(valid => valid === true)) {
            return {
                isValid: true,
                body: data,
            };
        } else {
            return {
                isValid: false,
                body: data,
            };
        }
    }

    private validateBookingReservation = async (params: ValidationData): Promise<ValidationResponse> => {
        const urlAvailability = `${params.url}/availability`;

        const dataAvailability: Availability[] = await got.post(urlAvailability, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"},body:JSON.stringify({
            productId: this.config().productId,
            optionId: this.config().optionId,
            localDate: this.config().localDate,
        })}).json();

        const urlBooking = `${params.url}/bookings`;

        const body = JSON.stringify({
            productId: this.config().productId,
            optionId: this.config().optionId,
            availabilityId: dataAvailability[0].id,
            unitItems: [
                {
                    unitId: dataAvailability[0].unitPricing[0].unitId
                },
                {
                    unitId: dataAvailability[0].unitPricing[0].unitId
                }
            ]
        })

        const dataBooking: any = await got.post(urlBooking, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"},body}).json();

        try {
            this.bookingValidator.validate(dataBooking);
            return {
                isValid: true,
                body: dataBooking,
            }
        } catch (e) {
            console.log('invalid booking', dataBooking)
            console.log(e)
            return {
                isValid: false,
                body: dataBooking,
            }
        }
    }

    private validateListBookings = async (params: ValidationData): Promise<ValidationResponse> => {
        const urlAvailability = `${params.url}/availability`;

        const dataAvailability: Availability[] = await got.post(urlAvailability, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"},body:JSON.stringify({
            productId: this.config().productId,
            optionId: this.config().optionId,
            localDate: this.config().localDate,
        })}).json();

        const urlBooking = `${params.url}/bookings`;

        const body = JSON.stringify({
            productId: this.config().productId,
            optionId: this.config().optionId,
            availabilityId: dataAvailability[0].id,
            unitItems: [
                {
                    unitId: dataAvailability[0].unitPricing[0].unitId
                },
                {
                    unitId: dataAvailability[0].unitPricing[0].unitId
                }
            ]
        })

        const dataBooking: any = await got.post(urlBooking, {headers:{"Authorization":`Bearer ${this.config().token}`,"Octo-Capabilities":"octo/content,octo/pricing"},body}).json();

        try {
            this.bookingValidator.validate(dataBooking);
            return {
                isValid: true,
                body: dataBooking,
            }
        } catch (e) {
            console.log('invalid booking', dataBooking)
            console.log(e)
            return {
                isValid: false,
                body: dataBooking,
            }
        }
    }


    public validate = async (params: ValidationData): Promise<ValidationResponse> => {
        if (params.method === OctoMethod.GetSuppliers) {
            const response = await this.validateGetSuppliers(params)
            return response;
        }

        if (params.method === OctoMethod.GetSupplier) {
            const response = await this.validateGetSupplier(params)
            return response;
        }

        if (params.method === OctoMethod.GetProducts) {
            const response = await this.validateGetProducts(params)
            return response;
        }

        if (params.method === OctoMethod.GetProduct) {
            const response = await this.validateGetProduct(params)
            return response;
        }

        if (params.method === OctoMethod.AvailabilityCheck) {
            const response = await this.validateAvailabilityCheck(params)
            return response;
        }

        if (params.method === OctoMethod.AvailabilityCalendar) {
            const response = await this.validateAvailabilityCalendar(params)
            return response;
        }

        if (params.method === OctoMethod.BookingReservation) {
            const response = await this.validateBookingReservation(params)
            return response;
        }

        if (params.method === OctoMethod.ListBookings) {
            const response = await this.validateListBookings(params)
            return response;
        }
    }
}
