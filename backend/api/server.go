package api

import (
	"github.com/corey888773/online-travel-agency-website/data"
	"github.com/corey888773/online-travel-agency-website/token"
	"github.com/corey888773/online-travel-agency-website/util"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type Server struct {
	router     *gin.Engine
	config     util.Config
	mongoDb    *mongo.Client
	tokenMaker token.TokenMaker

	tripRepository data.TripRepository
	userRepository data.UserRepository
}

func NewServer(config util.Config, mongoClient *mongo.Client, tokenMaker token.TokenMaker) (*Server, error) {
	s := &Server{
		config:     config,
		mongoDb:    mongoClient,
		tokenMaker: tokenMaker,
	}
	s.SetupRouter()
	s.setupDb()
	return s, nil
}

func (s *Server) SetupRouter() {
	s.router = gin.Default()

	// user routes
	s.router.POST("/register", s.registerUser)
	s.router.POST("/login", s.loginUser)

	// trip routes
	s.router.POST("/trips", s.addTrip)
	s.router.GET("/trips/:id", s.getTrip)
	s.router.GET("/trips", s.listTrips)
	s.router.PATCH("/trips/:id", s.updateTrip)
	s.router.DELETE("/trips/:id", s.deleteTrip)

	// file server
	s.router.Static("/public", "./public")
	s.router.POST("/uploadImage", s.uploadImage)
}

func (s *Server) setupDb() error {
	database := s.mongoDb.Database("travel_agency")

	tripCollection := database.Collection("trips")
	tripRepository, err := data.NewMongoDbTripRepository(*tripCollection)
	if err != nil {
		return err
	}
	s.tripRepository = tripRepository

	usersCollection := database.Collection("users")
	userRepository, err := data.NewMongoDbUserRepository(*usersCollection)
	if err != nil {
		return err
	}
	s.userRepository = userRepository
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
