export interface TripReservation {
    id: string;
    tripID: string;
    tripName: string;
    tripDestination: string;
    tripStartDate: Date;
    tripEndDate: Date;
    quantity: number;
    rating: number;
    reservationStatus: string;
    reservationStatusChangedAt: Date;
}
