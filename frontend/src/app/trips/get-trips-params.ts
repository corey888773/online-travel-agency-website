export interface GetTripsParams {
    minPrice: number | undefined;
    maxPrice: number | undefined;
    searchTerm: string | undefined;
    ratings: number[] | undefined;
    destination: string | undefined;
    minDate: Date | undefined;
    maxDate: Date | undefined;
    sortBy: string | undefined;
}
