package data

import (
	"fmt"
	"time"

	"github.com/corey888773/online-travel-agency-website/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Trip struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	UnitPrice   string             `bson:"price"`
	Destination string             `bson:"destination"`
	StartDate   time.Time          `bson:"startDate"`
	EndDate     time.Time          `bson:"endDate"`
	ImgUrl      string             `bson:"imgUrl"`
	ImgAlt      string             `bson:"imgAlt"`
	Currency    types.Currency     `bson:"currency"`
	MaxGuests   int64              `bson:"maxGuests"`
	Available   int64              `bson:"available"`
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

func NewMongoDbTripRepository(tripCollection mongo.Collection) (TripRepository, error) {
	ctx, cancel := createContext()
	defer cancel()

	_, err := tripCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.M{"name": 1},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create name index: %w", err)
	}

	return &MongoDbTripRepository{
		collection: &tripCollection,
	}, nil
}

func (r *MongoDbTripRepository) FindAll() ([]Trip, error) {
	ctx, cancel := createContext()
	defer cancel()

	trips := []Trip{}
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

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
		return nil, fmt.Errorf("failed to find trip: %w", err)
	}

	err = result.Decode(&trip)
	{
		if err != nil {
			return nil, fmt.Errorf("failed to decode trip: %w", err)
		}
	}

	return &trip, nil
}

func (r *MongoDbTripRepository) Add(trip *Trip) (string, error) {
	ctx, cancel := createContext()
	defer cancel()

	trip.ID = primitive.NewObjectID()
	_, err := r.collection.InsertOne(ctx, trip)
	if err != nil {
		return "", fmt.Errorf("failed to insert trip: %w", err)
	}

	return trip.ID.Hex(), nil
}

func (r *MongoDbTripRepository) Update(id string, updatedTrip *Trip) error {
	ctx, cancel := createContext()
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("failed to convert id: %w", err)
	}

	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": updatedTrip})

	if err != nil {
		return fmt.Errorf("failed to update trip: %w", err)
	}

	return nil
}

func (r *MongoDbTripRepository) Delete(id string) error {
	ctx, cancel := createContext()
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("failed to convert id: %w", err)
	}

	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		return fmt.Errorf("failed to delete trip: %w", err)
	}

	return nil
}
