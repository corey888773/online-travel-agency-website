package data

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Trip struct {
	Name        string    `bson:"name"`
	UnitPrice   string    `bson:"price"`
	Destination string    `bson:"destination"`
	StartDate   time.Time `bson:"startDate"`
	EndDate     time.Time `bson:"endDate"`
	ImgUrl      string    `bson:"imgUrl"`
	ImgAlt      string    `bson:"imgAlt"`
	Currency    string    `bson:"currency"`
	MaxGuests   int64     `bson:"maxGuests"`
	Available   int64     `bson:"available"`
}

type TripRepository interface {
	FindAll() ([]Trip, error)
	FindByID(id string) (*Trip, error)
	Add(trip *Trip) (string, error)
	Update(id string, trip *Trip) error
	Delete(id string) error
}

type MongoDbTripRepository struct {
	collection *mongo.Collection
}

func NewMongoDbTripRepository(tripCollection mongo.Collection) TripRepository {
	return &MongoDbTripRepository{
		collection: &tripCollection,
	}
}

func (r *MongoDbTripRepository) FindAll() ([]Trip, error) {
	ctx, cancel := createContext()
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	var trips []Trip
	if err = cursor.All(ctx, &trips); err != nil {
		return nil, err
	}

	return trips, nil
}

func (r *MongoDbTripRepository) FindByID(id string) (*Trip, error) {
	ctx, cancel := createContext()
	defer cancel()

	trip := Trip{}
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	result := r.collection.FindOne(ctx, bson.M{"_id": objectID})

	if err := result.Err(); err != nil {
		return nil, err
	}

	err = result.Decode(&trip)
	{
		if err != nil {
			return nil, err
		}
	}

	return &trip, nil
}

func (r *MongoDbTripRepository) Add(trip *Trip) (string, error) {
	ctx, cancel := createContext()
	defer cancel()

	result, err := r.collection.InsertOne(ctx, trip)
	if err != nil {
		return "", err
	}

	objectID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", errors.New("failed to convert inserted ID")
	}

	return objectID.String(), nil
}

func (r *MongoDbTripRepository) Update(id string, updatedTrip *Trip) error {
	ctx, cancel := createContext()
	defer cancel()

	updated := bson.M{
		"$set": bson.M{
			"name":        updatedTrip.Name,
			"price":       updatedTrip.UnitPrice,
			"destination": updatedTrip.Destination,
			"startDate":   updatedTrip.StartDate,
			"endDate":     updatedTrip.EndDate,
			"imgUrl":      updatedTrip.ImgUrl,
			"imgAlt":      updatedTrip.ImgAlt,
			"currency":    updatedTrip.Currency,
			"maxGuests":   updatedTrip.MaxGuests,
			"available":   updatedTrip.Available,
		},
	}

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.UpdateByID(ctx, objectID, updated)
	if err != nil {
		return err
	}

	return nil
}

func (r *MongoDbTripRepository) Delete(id string) error {
	ctx, cancel := createContext()
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return err
	}

	return nil
}

func createContext() (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	return ctx, cancel
}
