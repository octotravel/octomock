import { Supplier } from '@octocloud/types';
import got from 'got';
import { SupplierValidator } from '../validators/backendValidator/SupplierValidator';

interface IOctoValidationService {
    validate(params: ValidationData): Promise<Boolean>;
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

export enum BackendType {
    octo = 'octo',
    anchor = 'anchor',
    fareharbor = 'fareharbor',
}

export interface ValidationData {
    url: string;
    method: OctoMethod;
    backend: BackendType;
}

export class OctoValidationService implements IOctoValidationService {
    private suppliertValidator = new SupplierValidator();

    private getHeaders = (backend: BackendType) => {
        if (backend === BackendType.anchor) {
            return {"Authorization": "Bearer anchortest"}
        }
        if (backend === BackendType.fareharbor) {
            return {"Authorization": "Bearer fareharbortest"}
        }  
    }

    private validateGetSuppliers = async (params: ValidationData): Promise<Boolean> => {
        const fullUrl = `${params.url}/suppliers`;
        const headers = this.getHeaders(params.backend)
        const data: Array<any> = await got.get(fullUrl, {headers}).json();

        const valids: any[] = data.map(supplier => {
            try {
                this.suppliertValidator.validate(supplier as Supplier);
                return true
            } catch (e) {
                return false
            }
        })
        console.log(valids)
        if (valids.every(valid => valid === true)) {
            return true;
        } else {
            return false;
        }
    }

    public validate = async (params: ValidationData): Promise<Boolean> => {
        if (params.method === OctoMethod.GetSuppliers) {
            const response = await this.validateGetSuppliers(params)
            return response;
        }
    }
}
