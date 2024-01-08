export interface Trip {
    id: string | undefined;
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
    ratings: Rating[];
}

export interface Rating {
    username: string;
    rating: number;
}
