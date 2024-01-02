export interface Trip {
    uuid: string;
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
    averageRating: number;
    ratings: number[];
}
