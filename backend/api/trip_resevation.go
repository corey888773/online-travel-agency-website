package api

import (
	"errors"
	"fmt"
	"net/http"
	"sort"
	"time"

	"github.com/corey888773/online-travel-agency-website/data"
	"github.com/corey888773/online-travel-agency-website/token"
	"github.com/corey888773/online-travel-agency-website/types"
	"github.com/gin-gonic/gin"
)

var (
	ErrTripNotAvailable = errors.New("trip not available")
)

type addReservationRequest struct {
	Username string `json:"username"`
	TripID   string `json:"tripID"`
	Quantity int64  `json:"quantity"`
}

func (s *Server) addReservation(ctx *gin.Context) {
	var request addReservationRequest
	if err := ctx.ShouldBind(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	trip, err := s.tripRepository.FindByID(request.TripID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	fmt.Println(trip.Available, request.Quantity)
	if trip.Available < request.Quantity {
		ctx.JSON(http.StatusBadRequest, errorResponse(ErrTripNotAvailable))
		return
	}

	trip.Available -= request.Quantity

	err = s.tripRepository.Update(request.TripID, trip)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	tripReservation := data.TripReservation{
		Trip:     *trip,
		Quantity: request.Quantity,
		Rating:   0,
		ReservationStatus: data.ReservationStatus{
			Status:    types.StatusPending.String(),
			ChangedAt: time.Now(),
		},
	}

	_, err = s.tripReservationRepository.Add(request.Username, &tripReservation)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, successResponse())
}

func (s *Server) getMyReservations(ctx *gin.Context) {
	authPayload, ok := ctx.Get(authorizationPayloadKey)
	if !ok {
		err := errors.New("authorization payload not found")
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	pl := authPayload.(*token.Payload)

	user, err := s.userRepository.FindByUsername(pl.Username)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// sort by changedAt desc
	sort.Slice(user.TripReservations, func(i, j int) bool {
		return user.TripReservations[i].ReservationStatus.ChangedAt.Before(user.TripReservations[j].ReservationStatus.ChangedAt)
	})

	ctx.JSON(http.StatusOK, gin.H{
		"tripReservations": user.TripReservations,
	})
}

type changeReservationStatusRequest struct {
	ReservationID string `json:"reservationID"`
	Status        string `json:"status"`
	Username      string `json:"username"`
}

func (s *Server) changeReservationStatus(ctx *gin.Context) {
	var request changeReservationStatusRequest
	if err := ctx.ShouldBind(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	tripReservation, err := s.tripReservationRepository.FindOne(request.Username, request.ReservationID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	tripReservation.ReservationStatus.Status = request.Status
	tripReservation.ReservationStatus.ChangedAt = time.Now()

	err = s.tripReservationRepository.Update(request.Username, tripReservation)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, successResponse())
}

type deleteReservationRequest struct {
	ReservationID string `json:"reservationID"`
	Username      string `json:"username"`
}

func (s *Server) deleteReservation(ctx *gin.Context) {
	var request deleteReservationRequest
	if err := ctx.ShouldBind(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	err := s.tripReservationRepository.Delete(request.Username, request.ReservationID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, successResponse())
}

type rateTripRequest struct {
	ReservationID string `json:"reservationID"`
	Username      string `json:"username"`
	Rating        int64  `json:"rating"`
}

func (s *Server) rateTrip(ctx *gin.Context) {
	var request rateTripRequest
	if err := ctx.ShouldBind(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	err := s.tripReservationRepository.Rate(request.Username, request.ReservationID, request.Rating)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, successResponse())
}
