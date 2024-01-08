package api

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/corey888773/online-travel-agency-website/token"
	"github.com/gin-gonic/gin"
)

const (
	authorizationHeaderKey  = "authorization"
	authorizationTypeBearer = "bearer"
	authorizationPayloadKey = "authorization_payload"
)

func authenticationMiddleware(tokenMaker token.TokenMaker) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader(authorizationHeaderKey)
		if len(authHeader) == 0 {
			err := errors.New("authorization header was not provided")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		fields := strings.Split(authHeader, " ")
		if len(fields) < 2 {
			err := errors.New("authorization header wrong format")
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		authType := strings.ToLower(fields[0])
		if authType != authorizationTypeBearer {
			err := fmt.Errorf("unsupported authorization type %s", authType)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		accessToken := fields[1]
		payload, err := tokenMaker.VerifyToken(accessToken)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
			return
		}

		ctx.Set(authorizationPayloadKey, payload)
		ctx.Next()
	}
}

func authorizationMiddleware(authorizedRoles ...string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		payload, ok := ctx.Get(authorizationPayloadKey)
		if !ok {
			err := errors.New("authorization payload not found")
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse(err))
			return
		}

		pl := payload.(*token.Payload)
		for _, role := range authorizedRoles {
			if role == pl.Role {
				ctx.Next()
				return
			}
		}

		err := errors.New("you are not authorized to access this resource")
		ctx.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err))
	}
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, enctype, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
