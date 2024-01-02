export interface Basket {
    reservations: Reservation[];
    totalPrice: number;
    currency: string;
}

export interface Reservation {
    tripUuid: string;
    quantity: number;
}