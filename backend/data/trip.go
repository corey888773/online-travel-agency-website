package data

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/corey888773/online-travel-agency-website/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Trip struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name          string             `bson:"name" json:"name"`
	UnitPrice     int64              `bson:"price" json:"price"`
	Destination   string             `bson:"destination" json:"destination"`
	Description   string             `bson:"description" json:"description"`
	StartDate     time.Time          `bson:"startDate" json:"startDate"`
	EndDate       time.Time          `bson:"endDate" json:"endDate"`
	ImgUrl        string             `bson:"imgUrl" json:"imgUrl"`
	ImgAlt        string             `bson:"imgAlt" json:"imgAlt"`
	Currency      types.Currency     `bson:"currency" json:"currency"`
	MaxGuests     int64              `bson:"maxGuests" json:"maxGuests"`
	Available     int64              `bson:"available" json:"available"`
	Ratings       []Rating           `bson:"ratings" json:"ratings"`
	AverageRating float64            `bson:"averageRating" json:"averageRating"`
}

type Rating struct {
	Username string `bson:"username" json:"username"`
	Rating   int64  `bson:"rating" json:"rating"`
}

type TripRepository interface {
	FindAll(params FindTripsParams) ([]Trip, error)
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

type FindTripsParams struct {
	MinPrice    int64
	MaxPrice    int64
	SearchTerm  string
	Ratings     string
	Destination string
	MinDate     time.Time
	MaxDate     time.Time
	SortBy      string
}

func (r *MongoDbTripRepository) FindAll(params FindTripsParams) ([]Trip, error) {
	ctx, cancel := createContext()
	defer cancel()

	filter := bson.M{}

	if params.MinPrice > 0 {
		filter["price"] = bson.M{
			"$gte": params.MinPrice,
		}
	}
	if params.MaxPrice > 0 && params.MaxPrice >= params.MinPrice {
		filter["price"] = bson.M{
			"$lte": params.MaxPrice,
		}
	}

	if params.Destination != "" {
		filter["destination"] = bson.M{
			"$regex":   params.Destination,
			"$options": "i",
		}
	}

	if params.SearchTerm != "" {
		filter["name"] = bson.M{
			"$regex":   params.SearchTerm,
			"$options": "i",
		}
	}

	if !params.MinDate.IsZero() {
		filter["startDate"] = bson.M{
			"$gte": params.MinDate,
		}
		filter["endDate"] = bson.M{
			"$gte": params.MinDate,
		}
	}

	if !params.MaxDate.IsZero() && params.MaxDate.After(params.MinDate) {
		filter["startDate"] = bson.M{
			"$lte": params.MaxDate,
		}
		filter["endDate"] = bson.M{
			"$lte": params.MaxDate,
		}
	}

	averageRatingFilter := []bson.M{}
	if len(params.Ratings) > 0 {
		ratings := strings.Split(params.Ratings, ",")
		for _, rating := range ratings {
			ratingInt, err := strconv.Atoi(rating)
			if err != nil {
				return nil, fmt.Errorf("failed to convert rating: %w", err)
			}
			averageRatingFilter = append(averageRatingFilter, bson.M{
				"averageRating": bson.M{
					"$gte": float64(ratingInt),
					"$lt":  float64(ratingInt + 1),
				},
			})
		}
	}
	if len(averageRatingFilter) > 0 {
		filter["$or"] = averageRatingFilter
	}

	sortOptions := options.Find()
	var sortRule bson.M
	if params.SortBy != "" {
		sortOrder := 1

		if params.SortBy[0] == '-' {
			params.SortBy = params.SortBy[1:]
			sortOrder = -1
		}

		sortRule = bson.M{
			params.SortBy: sortOrder,
		}
	}

	sortOptions.SetSort(sortRule)

	trips := []Trip{}
	cursor, err := r.collection.Find(ctx, filter, sortOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to find trips: %w", err)
	}

	if err = cursor.All(ctx, &trips); err != nil {
		return nil, fmt.Errorf("failed to decode trips: %w", err)
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
