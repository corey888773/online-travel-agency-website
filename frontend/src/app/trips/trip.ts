export interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    description: string;
    price: number;
    currency: string;
    maxGuests: number;
    available: number;
    imgUrl: string;
    imgAlt: string;
    reserved: boolean;
    averageRating: number;
    ratings: number[];
}
