package api

import (
	"errors"
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
	FullName          string    `json:"full_name"`
	Email             string    `json:"email"`
	Role              string    `json:"role"`
	PasswordChangedAt time.Time `json:"password_changed_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	CreatedAt         time.Time `json:"created_at"`
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
	SessionID             string       `json:"session_id"`
	AccessToken           string       `json:"access_token"`
	AccessTokenExpiresAt  time.Time    `json:"access_token_expires_at"`
	RefreshToken          string       `json:"refresh_token"`
	RefreshTokenExpiresAt time.Time    `json:"refresh_token_expires_at"`
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
	NewPassword string `json:"new_password"`
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
