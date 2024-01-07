package token

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

var (
	ErrExpiredToken = errors.New("token has expired")
	ErrInvalidToken = errors.New("error invalid token")
)

type Payload struct {
	ID        uuid.UUID `json:"id"`
	UserId    string    `json:"user_id"`
	Username  string    `json:"username"`
	Role      string    `json:"roles"`
	IssuedAt  time.Time `json:"issued_at"`
	ExpiredAt time.Time `json:"expired_at"`
}

func NewPayload(userId string, username string, role string, duration time.Duration) (*Payload, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, fmt.Errorf("failed to generate token id: %w", err)
	}

	return &Payload{
		ID:        id,
		UserId:    userId,
		Username:  username,
		Role:      role,
		IssuedAt:  time.Now(),
		ExpiredAt: time.Now().Add(duration),
	}, nil
}

func (p *Payload) Valid() error {
	if time.Now().After(p.ExpiredAt) {
		return ErrExpiredToken
	}
	return nil
}
