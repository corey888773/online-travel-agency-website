package main

import (
	"context"
	"os"
	"time"

	"github.com/corey888773/online-travel-agency-website/api"
	"github.com/corey888773/online-travel-agency-website/token"
	"github.com/corey888773/online-travel-agency-website/util"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// TODO: Set up such logging on development environment
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	config, err := util.LoadConfig(".")
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load config")
	}

	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(config.MongoUri))
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to MongoDB")
	}

	pasetoMaker, err := token.NewPasetoMaker(config.TokenSymmetricKey)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create token maker")
	}

	server, err := api.NewServer(config, mongoClient, pasetoMaker)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create server")
	}

	err = server.Start(config.HttpServerAddress)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to start server")
	}
}
