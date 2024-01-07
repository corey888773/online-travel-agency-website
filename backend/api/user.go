package api

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/corey888773/online-travel-agency-website/data"
	"github.com/corey888773/online-travel-agency-website/token"
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

type userResponse struct {
	ID                string    `json:"id"`
	Username          string    `json:"username"`
	FullName          string    `json:"fullName"`
	Email             string    `json:"email"`
	Role              string    `json:"role"`
	PasswordChangedAt time.Time `json:"passwordChangedAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
	CreatedAt         time.Time `json:"createdAt"`
}

func newUserResponse(user *data.User) userResponse {
	return userResponse{
		ID:                user.ID.Hex(),
		Username:          user.Username,
		FullName:          user.FullName,
		Role:              user.Role.String(),
		Email:             user.Email,
		PasswordChangedAt: user.PasswordChangedAt,
		CreatedAt:         user.CreatedAt,
	}
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
		user.Role = types.AdminRole
	} else {
		user.Role = types.UserRole
	}

	_, err = s.userRepository.Add(&user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newUserResponse(&user))
}

type loginUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginUserResponse struct {
	User                  userResponse `json:"user"`
	SessionID             string       `json:"sessionID"`
	AccessToken           string       `json:"accessToken"`
	AccessTokenExpiresAt  time.Time    `json:"accessTokenExpiresAt"`
	RefreshToken          string       `json:"refreshToken"`
	RefreshTokenExpiresAt time.Time    `json:"refreshTokenExpiresAt"`
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

	accessToken, accessTokenPayload, err := s.tokenMaker.CreateToken(user.ID.Hex(), user.Username, user.Role.String(), s.config.AccessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	refreshToken, refreshTokenPayload, err := s.tokenMaker.CreateToken(user.ID.Hex(), user.Username, user.Role.String(), s.config.RefreshTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	session := data.Session{
		RefreshToken: refreshToken,
		Username:     user.Username,
		ExpiresAt:    refreshTokenPayload.ExpiredAt,
		CreatedAt:    time.Now(),
		UserAgent:    ctx.Request.UserAgent(),
		ClientIP:     ctx.ClientIP(),
		IsBlocked:    false,
	}

	_, err = s.sessionRepository.Create(&session)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, loginUserResponse{
		User:                  newUserResponse(user),
		AccessToken:           accessToken,
		AccessTokenExpiresAt:  accessTokenPayload.ExpiredAt,
		RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: refreshTokenPayload.ExpiredAt,
		SessionID:             session.ID.Hex(),
	})
}

type updateUserRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	FullName string `json:"fullName"`
}

func (s *Server) updateUser(ctx *gin.Context) {
	var request updateUserRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	id := ctx.Param("id")

	user := data.User{
		Username:  request.Username,
		Email:     request.Email,
		FullName:  request.FullName,
		UpdatedAt: time.Now(),
	}

	err := s.userRepository.Update(id, &user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newUserResponse(&user))
}

type updateUserRoleRequest struct {
	Role string `json:"role"`
}

func (s *Server) updateUserRole(ctx *gin.Context) {
	var request updateUserRoleRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	id := ctx.Param("id")

	user := data.User{
		Role:      types.Role(request.Role),
		UpdatedAt: time.Now(),
	}

	err := s.userRepository.Update(id, &user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newUserResponse(&user))
}

func (s *Server) deleteUser(ctx *gin.Context) {
	id := ctx.Param("id")

	err := s.userRepository.Delete(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}

type listUsersResponse struct {
	Users []userResponse `json:"users"`
}

func (s *Server) listUsers(ctx *gin.Context) {
	users, err := s.userRepository.FindAll()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	var response listUsersResponse
	for _, user := range users {
		response.Users = append(response.Users, newUserResponse(&user))
	}

	ctx.JSON(http.StatusOK, response)
}

type updatePasswordRequest struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	NewPassword string `json:"newPassword"`
}

func (s *Server) updatePassword(ctx *gin.Context) {
	var request updatePasswordRequest
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

	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		err := errorResponse(errors.New("authorization payload not found"))
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}

	pl := authPayload.(*token.Payload)
	if pl.Role != types.AdminRole && pl.Username != request.Username {
		err := errorResponse(errors.New("user is not authorized to change password"))
		ctx.JSON(http.StatusUnauthorized, err)
		return
	}

	hashedPassword, err := util.HashPassword(request.NewPassword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	user.HashedPassword = hashedPassword
	user.PasswordChangedAt = time.Now()

	err = s.userRepository.Update(user.Username, user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newUserResponse(user))
}

func (s *Server) getCurrentUser(ctx *gin.Context) {
	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		err := errorResponse(errors.New("authorization payload not found"))
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}

	pl := authPayload.(*token.Payload)
	user, err := s.userRepository.FindByUsername(pl.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newUserResponse(user))
}

type renewAccessTokenRequest struct {
	SessionID    string `json:"sessionID"`
	RefreshToken string `json:"refreshToken"`
}

type renewAccessTokenResponse struct {
	AccessToken          string    `json:"accessToken"`
	AccessTokenExpiresAt time.Time `json:"accessTokenExpiresAt"`
}

func (s *Server) renewAccessToken(ctx *gin.Context) {
	var request renewAccessTokenRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	payload, err := s.tokenMaker.VerifyToken(request.RefreshToken)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, errorResponse(err))
		return
	}

	session, err := s.sessionRepository.FindByID(request.SessionID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if session.IsBlocked {
		err := errorResponse(errors.New("session is blocked"))
		ctx.JSON(http.StatusUnauthorized, err)
		return
	}

	if session.Username != payload.Username {
		err := errorResponse(errors.New("incorrect session user"))
		ctx.JSON(http.StatusUnauthorized, err)
		return
	}

	if session.RefreshToken != request.RefreshToken {
		err := errorResponse(errors.New("incorrect session refresh token"))
		ctx.JSON(http.StatusUnauthorized, err)
		return
	}

	if time.Now().After(session.ExpiresAt) {
		err := errorResponse(errors.New("session expired"))
		ctx.JSON(http.StatusUnauthorized, err)
		return
	}

	accessToken, accessTokenPayload, err := s.tokenMaker.CreateToken(payload.UserId, payload.Username, payload.Role, s.config.AccessTokenDuration)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	fmt.Println(accessTokenPayload)

	ctx.JSON(http.StatusOK, renewAccessTokenResponse{
		AccessToken:          accessToken,
		AccessTokenExpiresAt: accessTokenPayload.ExpiredAt,
	})
}
