package token

import (
	"time"

	"github.com/corey888773/online-travel-agency-website/data"
)

var (
	ErrInvalidKey = "invalid key"
)

type TokenMaker interface {
	CreateToken(user *data.User, duration time.Duration) (string, *Payload, error)
	VerifyToken(token string) (*Payload, error)
}
