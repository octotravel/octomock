import { Product, Supplier } from '@octocloud/types';
import got from 'got';
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
        }
    }
    private suppliertValidator = new SupplierValidator();
    private productValidator = new ProductValidator('octo', []);

    private validateGetSuppliers = async (params: ValidationData): Promise<ValidationResponse> => {
        const fullUrl = `${params.url}/suppliers`;
        const data: Array<any> = await got.get(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`}}).json();

        const valids: any[] = data.map(supplier => {
            try {
                this.suppliertValidator.validate(supplier as Supplier);
                return true
            } catch (e) {
                console.log('invalid supplier', supplier)
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
        const data: any = await got.get(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`}}).json();

        try {
            this.suppliertValidator.validate(data as Supplier);
            return {
                isValid: true,
                body: data,
            }
        } catch (e) {
            console.log('invalid supplier', data)
            return {
                isValid: false,
                body: data,
            }
        }
    }

    private validateGetProducts = async (params: ValidationData): Promise<ValidationResponse> => {
        const fullUrl = `${params.url}/products`;
        console.log(fullUrl)
        const data: Array<any> = await got.get(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`}}).json();

        const valids: any[] = data.map(product => {
            try {
                this.productValidator.validate(product as Product);
                return true
            } catch (e) {
                console.log('invalid product', product)
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
        const data: any = await got.get(fullUrl, {headers:{"Authorization":`Bearer ${this.config().token}`}}).json();

        try {
            this.productValidator.validate(data as Product);
            return {
                isValid: true,
                body: data,
            }
        } catch (e) {
            console.log('invalid product', data)
            return {
                isValid: false,
                body: data,
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
    }
}
