package api

import (
	"github.com/corey888773/online-travel-agency-website/data"
	"github.com/corey888773/online-travel-agency-website/token"
	"github.com/corey888773/online-travel-agency-website/types"
	"github.com/corey888773/online-travel-agency-website/util"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type Server struct {
	router     *gin.Engine
	config     util.Config
	mongoDb    *mongo.Client
	tokenMaker token.TokenMaker

	tripRepository    data.TripRepository
	userRepository    data.UserRepository
	sessionRepository data.SessionRepository
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

	s.router.Use(CORSMiddleware())

	// login/register routes
	s.router.POST("/register", s.registerUser)
	s.router.POST("/login", s.loginUser)

	// user maintanence routes
	userRoutes := s.router.Group("/users").Use(authenticationMiddleware(s.tokenMaker))
	userRoutes.GET("/", s.listUsers)
	userRoutes.GET("/me", s.getCurrentUser)
	userRoutes.DELETE("/:id", s.deleteUser)
	userRoutes.PATCH("/:id", s.updateUser)
	userRoutes.PATCH("/password", s.updatePassword)

	// trip routes
	tripRoutes := s.router.Group("/trips").Use(authenticationMiddleware(s.tokenMaker))
	tripRoutes.GET("/", s.listTrips)
	tripRoutes.GET("/:id", s.getTrip)
	tripRoutes.Use(authorizationMiddleware(types.AdminRole)).POST("/", s.addTrip)
	tripRoutes.Use(authorizationMiddleware(types.AdminRole)).PATCH("/:id", s.updateTrip).DELETE("/:id", s.deleteTrip)

	// file server
	s.router.Use(authenticationMiddleware(s.tokenMaker)).Static("/public", "./public")
	s.router.Use(authenticationMiddleware(s.tokenMaker)).POST("/uploadImage", s.uploadImage)
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

	sessionCollecton := database.Collection("sessions")
	sessionRepository, err := data.NewMongoDbSessionRepository(*sessionCollecton)
	if err != nil {
		return err
	}
	s.sessionRepository = sessionRepository

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
