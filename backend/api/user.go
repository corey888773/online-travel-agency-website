package api

import (
	"net/http"
	"time"

	"github.com/corey888773/online-travel-agency-website/data"
	"github.com/corey888773/online-travel-agency-website/types"
	"github.com/corey888773/online-travel-agency-website/util"
	"github.com/gin-gonic/gin"
)

type registerUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"fullName"`
	Password string `json:"password"`
}

type registerUserResponse struct {
	ID                string    `json:"id"`
	Username          string    `json:"username"`
	FullName          string    `json:"fullName"`
	Email             string    `json:"email"`
	Role              string    `json:"role"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
	PasswordChangedAt time.Time `json:"passwordChangedAt"`
}

func (s *Server) registerUser(ctx *gin.Context) {
	var request registerUserRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	hashedPassword, err := util.HashPassword(request.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	user := data.User{
		Username:          request.Username,
		Email:             request.Email,
		FullName:          request.FullName,
		HashedPassword:    hashedPassword,
		IsEmailVerified:   true,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		PasswordChangedAt: time.Now(),
	}

	if request.Username == "admin" {
		user.Role = types.Admin
	} else {
		user.Role = types.User
	}

	objectID, err := s.userRepository.Add(&user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, registerUserResponse{
		ID:                objectID,
		Username:          user.Username,
		FullName:          user.FullName,
		Email:             user.Email,
		Role:              user.Role.String(),
		CreatedAt:         user.CreatedAt,
		UpdatedAt:         user.UpdatedAt,
		PasswordChangedAt: user.PasswordChangedAt,
	})
}

type loginUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginUserResponse struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

func (s *Server) loginUser(ctx *gin.Context) {
	var request loginUserRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	user, err := s.userRepository.FindByUsername(request.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	err = util.ComparePassword(request.Password, user.HashedPassword)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	accessToken, accessTokenPayload, err := s.tokenMaker.CreateToken(user, s.config.AccessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	refreshToken, refreshTokenPayload, err := s.tokenMaker.CreateToken(user, s.config.RefreshTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, loginUserResponse{
		ID:       user.ID.Hex(),
		Username: user.Username,
		FullName: user.FullName,
		Email:    user.Email,
		Role:     user.Role.String(),
	})
}
