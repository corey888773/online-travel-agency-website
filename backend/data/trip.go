package data

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TripRepository interface {
	FindAll() ([]Trip, error)
	FindByID(id string) (*Trip, error)
	Add(trip *Trip) (string, error)
	Update(trip *Trip) error
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
	// Implement the FindAll method
	return nil, nil
}

func (r *MongoDbTripRepository) FindByID(id string) (*Trip, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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

func (r *MongoDbTripRepository) Update(trip *Trip) error {
	// Implement the Update method
	return nil
}

func (r *MongoDbTripRepository) Delete(id string) error {
	// Implement the Delete method
	return nil
}

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
