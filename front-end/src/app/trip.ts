export interface Trip {
    name: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    description: string;
    unitPrice: number;
    currency: string;
    maxSlots: number;
    reservedSlots: number;
    image: string;
    reserved: boolean;
}
