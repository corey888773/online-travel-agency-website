package api

import (
	"net/http"
	"time"

	"github.com/corey888773/online-travel-agency-website/data"
	"github.com/corey888773/online-travel-agency-website/types"
	"github.com/gin-gonic/gin"
)

type addTripRequest struct {
	Name        string         `json:"name" binding:"required"`
	UnitPrice   string         `json:"price" binding:"required"`
	Destination string         `json:"destination" binding:"required"`
	StartDate   time.Time      `json:"startDate" binding:"required"`
	EndDate     time.Time      `json:"endDate" binding:"required"`
	ImgUrl      string         `json:"imgUrl" binding:"required"`
	ImgAlt      string         `json:"imgAlt" binding:"required"`
	Currency    types.Currency `json:"currency" binding:"required"`
	MaxGuests   int64          `json:"maxGuests" binding:"required"`
	Available   int64          `json:"available" binding:"required"`
}

type addTripResponse struct {
	ID string `json:"id"`
}

func (s *Server) addTrip(ctx *gin.Context) {
	var request addTripRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	trip := data.Trip{
		Name:        request.Name,
		UnitPrice:   request.UnitPrice,
		Destination: request.Destination,
		StartDate:   request.StartDate,
		EndDate:     request.EndDate,
		ImgUrl:      request.ImgUrl,
		ImgAlt:      request.ImgAlt,
		Currency:    request.Currency.String(),
		MaxGuests:   request.MaxGuests,
		Available:   request.Available,
	}

	objectID, err := s.tripRepository.Add(&trip)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, addTripResponse{
		ID: objectID,
	})
}

type getTripResponse struct {
	Trip data.Trip `json:"trip"`
}

func (s *Server) getTrip(ctx *gin.Context) {
	id := ctx.Param("id")

	trip, err := s.tripRepository.FindByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, getTripResponse{
		Trip: *trip,
	})
}
