package data

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Session struct {
	ID           primitive.ObjectID `bson:"_id" json:"id"`
	Username     string             `bson:"username" json:"username"`
	RefreshToken string             `bson:"refreshToken" json:"refreshToken"`
	UserAgent    string             `bson:"userAgent" json:"userAgent"`
	ClientIP     string             `bson:"clientIp" json:"clientIP"`
	IsBlocked    bool               `bson:"isBlocked" json:"isBlocked"`
	ExpiresAt    time.Time          `bson:"expiresAt" json:"expiresAt"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
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
