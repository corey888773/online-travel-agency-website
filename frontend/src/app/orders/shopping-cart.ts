export interface ShoppingCart {
    username: string;
    items: ShoppingCartItem[];
    totalPrice: number;
    currency: string;
}

export interface ShoppingCartItem {
    tripID: string;
    tripName: string;
    tripDestination: string;
    tripStartDate: Date;
    tripEndDate: Date;
    quantity: number;
    tripPrice: number;
    tripCurrency: string;
    tripAvailable: number;
}

