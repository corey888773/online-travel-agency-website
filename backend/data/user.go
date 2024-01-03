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

type User struct {
	ID                primitive.ObjectID `bson:"_id,omitempty"`
	Username          string             `bson:"username"`
	HashedPassword    string             `bson:"password"`
	Email             string             `bson:"email" unique:"true"`
	IsEmailVerified   bool               `bson:"isEmailVerified"`
	FullName          string             `bson:"firstName"`
	Role              types.Role         `bson:"role"`
	CreatedAt         time.Time          `bson:"createdAt"`
	UpdatedAt         time.Time          `bson:"updatedAt"`
	PasswordChangedAt time.Time          `bson:"passwordChangedAt"`
}

type UserRepository interface {
	FindByUsername(username string) (*User, error)
	FindAll() ([]User, error)
	Add(user *User) (string, error)
	Update(username string, user *User) error
	UpdatePassword(username string, password string) error
	Delete(username string) error
}

type MongoDbUserRepository struct {
	collection *mongo.Collection
}

func NewMongoDbUserRepository(userCollection mongo.Collection) (UserRepository, error) {
	ctx, cancel := createContext()
	defer cancel()

	_, err := userCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.M{"username": 1},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create username index: %w", err)
	}

	return &MongoDbUserRepository{
		collection: &userCollection,
	}, nil
}

func (r *MongoDbUserRepository) FindByUsername(username string) (*User, error) {
	ctx, cancel := createContext()
	defer cancel()

	user := User{}
	result := r.collection.FindOne(ctx, primitive.M{"username": username})
	if result.Err() != nil {
		return nil, fmt.Errorf("failed to find user: %w", result.Err())
	}

	if err := result.Decode(&user); err != nil {
		return nil, fmt.Errorf("failed to decode user: %w", err)
	}

	return &user, nil
}

func (r *MongoDbUserRepository) FindAll() ([]User, error) {
	ctx, cancel := createContext()
	defer cancel()

	users := []User{}
	cursor, err := r.collection.Find(ctx, primitive.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to find users: %w", err)
	}

	if err = cursor.All(ctx, &users); err != nil {
		return nil, fmt.Errorf("failed to decode users: %w", err)
	}

	return users, nil
}

func (r *MongoDbUserRepository) Add(user *User) (string, error) {
	ctx, cancel := createContext()
	defer cancel()

	user.ID = primitive.NewObjectID()
	_, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		return "", fmt.Errorf("failed to insert user: %w", err)
	}

	return user.ID.Hex(), nil
}

func (r *MongoDbUserRepository) Update(username string, user *User) error {
	ctx, cancel := createContext()
	defer cancel()

	_, err := r.collection.UpdateOne(ctx, primitive.M{"username": username}, primitive.M{"$set": user})
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

func (r *MongoDbUserRepository) UpdatePassword(username string, password string) error {
	ctx, cancel := createContext()
	defer cancel()

	_, err := r.collection.UpdateOne(ctx, primitive.M{"username": username}, primitive.M{"$set": primitive.M{"password": password}})
	if err != nil {
		return fmt.Errorf("failed to update user password: %w", err)
	}

	return nil
}

func (r *MongoDbUserRepository) Delete(username string) error {
	ctx, cancel := createContext()
	defer cancel()

	_, err := r.collection.DeleteOne(ctx, primitive.M{"username": username})
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}
