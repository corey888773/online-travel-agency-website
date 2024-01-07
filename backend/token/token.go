package token

import (
	"time"
)

var (
	ErrInvalidKey = "invalid key"
)

type TokenMaker interface {
	CreateToken(userId string, username string, role string, duration time.Duration) (string, *Payload, error)
	VerifyToken(token string) (*Payload, error)
}
