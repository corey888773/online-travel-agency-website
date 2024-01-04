package data

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Session struct {
	ID           primitive.ObjectID `bson:"_id"`
	Username     string             `bson:"username"`
	RefreshToken string             `bson:"refresh_token"`
	UserAgent    string             `bson:"user_agent"`
	ClientIP     string             `bson:"client_ip"`
	IsBlocked    bool               `bson:"is_blocked"`
	ExpiresAt    time.Time          `bson:"expires_at"`
	CreatedAt    time.Time          `bson:"created_at"`
}

type SessionRepository interface {
	Create(session *Session) (string, error)
	FindByID(id string) (*Session, error)
}

type MongoDbSessionRepository struct {
	collection *mongo.Collection
}

func NewMongoDbSessionRepository(sessionCollection mongo.Collection) (SessionRepository, error) {
	return &MongoDbSessionRepository{
		collection: &sessionCollection,
	}, nil
}

func (r *MongoDbSessionRepository) Create(session *Session) (string, error) {
	ctx, cancel := createContext()
	defer cancel()

	session.ID = primitive.NewObjectID()

	_, err := r.collection.InsertOne(ctx, session)
	if err != nil {
		return "", err
	}

	return session.ID.Hex(), nil
}

func (r *MongoDbSessionRepository) FindByID(id string) (*Session, error) {
	ctx, cancel := createContext()
	defer cancel()

	var session Session
	err := r.collection.FindOne(ctx, &Session{ID: primitive.ObjectID{}}).Decode(&session)
	if err != nil {
		return nil, err
	}

	return &session, nil
}
