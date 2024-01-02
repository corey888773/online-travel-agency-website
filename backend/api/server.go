package api

import (
	"github.com/corey888773/online-travel-agency-website/data"
	"github.com/corey888773/online-travel-agency-website/util"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type Server struct {
	router  *gin.Engine
	config  util.Config
	mongoDb *mongo.Client

	tripRepository data.TripRepository
}

func NewServer(config util.Config, mongoClient *mongo.Client) (*Server, error) {
	s := &Server{
		config:  config,
		mongoDb: mongoClient,
	}
	s.SetupRouter()
	s.setupDb()
	return s, nil
}

func (s *Server) SetupRouter() {
	s.router = gin.Default()

	// trip routes
	s.router.POST("/trips", s.addTrip)

	// file server
	s.router.Static("/public", "./public")
	s.router.POST("/uploadImage", s.uploadImage)
}

func (s *Server) setupDb() error {
	database := s.mongoDb.Database("travel_agency")
	tripCollection := database.Collection("trips")
	tripRepository := data.NewMongoDbTripRepository(*tripCollection)
	s.tripRepository = tripRepository
	return nil
}

func (s *Server) Start(port string) error {
	return s.router.Run(port)
}

func errorResponse(err error) gin.H {
	return gin.H{
		"error": err.Error(),
	}
}
