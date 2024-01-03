package token

import (
	"errors"
	"fmt"
	"time"

	"github.com/corey888773/online-travel-agency-website/data"
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

func NewPayload(user *data.User, duration time.Duration) (*Payload, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, fmt.Errorf("failed to generate token id: %w", err)
	}

	return &Payload{
		ID:        id,
		UserId:    user.ID.Hex(),
		Username:  user.Username,
		Role:      user.Role.String(),
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
