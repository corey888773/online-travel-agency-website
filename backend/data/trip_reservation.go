package data

import (
	"fmt"
	"time"

	"github.com/corey888773/online-travel-agency-website/types"
	"github.com/corey888773/online-travel-agency-website/util"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TripReservation struct {
	ID                string            `json:"id" bson:"_id"`
	Trip              Trip              `json:"trip" bson:"trip"`
	Quantity          int64             `json:"quantity" bson:"quantity"`
	Rating            int64             `json:"rating" bson:"rating"`
	ReservationStatus ReservationStatus `json:"reservationStatus" bson:"reservationStatus"`
}

type ReservationStatus struct {
	Status    string    `json:"status" bson:"status"`
	ChangedAt time.Time `json:"changedAt" bson:"changedAt"`
}

type TripReservationRepository interface {
	FindOne(username string, reservationID string) (*TripReservation, error)
	Add(username string, tripReservation *TripReservation) (string, error)
	Update(username string, tripReservation *TripReservation) error
	Delete(username string, reservationID string) error
	ChangeStatus(id string, status string) error
	Rate(username string, reservationID string, rating int64) error
}

type MongoDbTripReservationRepository struct {
	userCollection *mongo.Collection
	tripCollection *mongo.Collection
}

func NewMongoDbTripReservationRepository(userCollection mongo.Collection, tripCollection mongo.Collection) (TripReservationRepository, error) {
	return &MongoDbTripReservationRepository{
		userCollection: &userCollection,
		tripCollection: &tripCollection,
	}, nil
}

func (r *MongoDbTripReservationRepository) FindOne(username string, reservationID string) (*TripReservation, error) {
	ctx, cancel := createContext()
	defer cancel()

	var user User
	err := r.userCollection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	for _, tr := range user.TripReservations {
		if tr.ID == reservationID {
			return &tr, nil
		}
	}

	return nil, fmt.Errorf("trip reservation not found")
}

func (r *MongoDbTripReservationRepository) Add(username string, tripReservation *TripReservation) (string, error) {
	ctx, cancel := createContext()
	defer cancel()

	tripReservation.ID = primitive.NewObjectID().Hex()

	var user User
	err := r.userCollection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return "", fmt.Errorf("failed to find user: %w", err)
	}

	// if user already contains trip reservation which tripId is equal to tripReservation.Trip.ID
	// then update quantity and return
	for i, tr := range user.TripReservations {
		if tr.Trip.ID == tripReservation.Trip.ID {
			user.TripReservations[i].Quantity += tripReservation.Quantity
			_, err := r.userCollection.UpdateOne(ctx, bson.M{"username": username}, bson.M{"$set": bson.M{"tripReservations": user.TripReservations}})
			if err != nil {
				return "", fmt.Errorf("failed to update trip reservation: %w", err)
			}
			return "", nil
		}
	}

	// else insert new trip reservation
	result, err := r.userCollection.UpdateOne(ctx, bson.M{"username": username}, bson.M{"$push": bson.M{"tripReservations": tripReservation}})
	if err != nil {
		return "", fmt.Errorf("failed to insert trip reservation: %w", err)
	}

	if result.MatchedCount == 0 {
		return "", fmt.Errorf("user not found")
	}

	return "", nil
}

func (r *MongoDbTripReservationRepository) Update(username string, tripReservation *TripReservation) error {
	ctx, cancel := createContext()
	defer cancel()

	var user User
	fmt.Println(username)
	err := r.userCollection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return fmt.Errorf("failed to find user: %w", err)
	}

	for i, tr := range user.TripReservations {
		if tr.ID == tripReservation.ID {
			user.TripReservations[i] = *tripReservation
			_, err := r.userCollection.UpdateOne(ctx, bson.M{"username": username}, bson.M{"$set": bson.M{"tripReservations": user.TripReservations}})
			if err != nil {
				return fmt.Errorf("failed to update trip reservation: %w", err)
			}
			return nil
		}
	}

	return fmt.Errorf("trip reservation not found")
}

func (r *MongoDbTripReservationRepository) Delete(username string, reservationId string) error {
	ctx, cancel := createContext()
	defer cancel()

	var user User
	err := r.userCollection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return fmt.Errorf("failed to find user: %w", err)
	}

	for i, tr := range user.TripReservations {
		if tr.ID == reservationId && tr.ReservationStatus.Status == types.StatusPending.String() {
			user.TripReservations = append(user.TripReservations[:i], user.TripReservations[i+1:]...)
			_, err := r.userCollection.UpdateOne(ctx, bson.M{"username": username}, bson.M{"$set": bson.M{"tripReservations": user.TripReservations}})
			if err != nil {
				return fmt.Errorf("failed to delete trip reservation: %w", err)
			}
		}
	}

	return nil
}

func (r *MongoDbTripReservationRepository) ChangeStatus(id string, status string) error {
	// TODO: Implement
	return nil
}

func (r *MongoDbTripReservationRepository) Rate(username string, reservationID string, rating int64) error {
	ctx, cancel := createContext()
	defer cancel()

	var user User
	err := r.userCollection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return fmt.Errorf("failed to find user: %w", err)
	}

	var trip Trip
	for i, tr := range user.TripReservations {
		if tr.ID == reservationID {
			user.TripReservations[i].Rating = rating
			_, err := r.userCollection.UpdateOne(ctx, bson.M{"username": username}, bson.M{"$set": bson.M{"tripReservations": user.TripReservations}})
			if err != nil {
				return fmt.Errorf("failed to update trip reservation: %w", err)
			}
			trip = tr.Trip
		}
	}

	var alreadyRated bool
	for i, r := range trip.Ratings {
		if r.Username == username {
			trip.Ratings[i].Rating = rating
			alreadyRated = true
		}
	}

	if !alreadyRated {
		trip.Ratings = append(trip.Ratings, Rating{
			Username: username,
			Rating:   rating,
		})
	}
	trip.AverageRating = calculateAverageRating(trip.Ratings)

	_, err = r.tripCollection.UpdateOne(ctx, bson.M{"_id": trip.ID}, bson.M{"$set": bson.M{"ratings": trip.Ratings, "averageRating": trip.AverageRating}})
	if err != nil {
		return fmt.Errorf("failed to update trip: %w", err)
	}

	return nil
}

func calculateAverageRating(ratings []Rating) float64 {
	var ratingsInt []int64
	for _, r := range ratings {
		ratingsInt = append(ratingsInt, r.Rating)
	}
	return util.Mean(ratingsInt)
}
