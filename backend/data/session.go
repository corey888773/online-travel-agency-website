package data

import "go.mongodb.org/mongo-driver/mongo"

type Session struct {
	ID           string `bson:"_id"`
	UserId       string `bson:"user_id"`
	RefreshToken string `bson:"refresh_token"`
	UserAgent    string `bson:"user_agent"`
	ClientIP     string `bson:"client_ip"`
	IsBlocked    bool   `bson:"is_blocked"`
	ExpiresAt    int64  `bson:"expires_at"`
	CreatedAt    int64  `bson:"created_at"`
}

type SessionRepository interface {
	Create(session *Session) error
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

func (r *MongoDbSessionRepository) Create(session *Session) error {
	return nil
}

func (r *MongoDbSessionRepository) FindByID(id string) (*Session, error) {
	return nil, nil
}
