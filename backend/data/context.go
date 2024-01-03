package data

import (
	"context"
	"time"
)

func createContext() (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	return ctx, cancel
}
