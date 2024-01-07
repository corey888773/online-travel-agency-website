package token

import (
	"fmt"
	"time"

	"github.com/aead/chacha20poly1305"
	"github.com/o1egl/paseto"
)

type PasetoMaker struct {
	paseto       *paseto.V2
	symmetricKey []byte
}

func NewPasetoMaker(symmetricKey string) (TokenMaker, error) {
	if (len(symmetricKey)) != chacha20poly1305.KeySize {
		return nil, fmt.Errorf("invalid key size, key should be exactly %v characters", chacha20poly1305.KeySize)
	}

	return &PasetoMaker{
		paseto:       paseto.NewV2(),
		symmetricKey: []byte(symmetricKey),
	}, nil
}

func (maker *PasetoMaker) CreateToken(userId string, username string, role string, duration time.Duration) (string, *Payload, error) {
	payload, err := NewPayload(userId, username, role, duration)
	if err != nil {
		return "", nil, err
	}

	token, err := maker.paseto.Encrypt(maker.symmetricKey, payload, nil)
	if err != nil {
		return "", nil, err
	}

	return token, payload, nil
}

func (maker *PasetoMaker) VerifyToken(token string) (*Payload, error) {
	payload := &Payload{}
	err := maker.paseto.Decrypt(token, maker.symmetricKey, payload, nil)
	if err != nil {
		return nil, ErrInvalidToken
	}

	err = payload.Valid()
	if err != nil {
		return nil, err
	}

	return payload, nil
}
