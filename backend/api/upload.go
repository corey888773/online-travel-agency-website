package api

import (
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type uploadImageResponse struct {
	ImgUrl string `json:"imgUrl"`
}

func (s *Server) uploadImage(ctx *gin.Context) {
	// accepts only up to 3 MB
	ctx.Request.ParseMultipartForm(3 << 20)

	file, handler, err := ctx.Request.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
	}
	defer file.Close()

	tempFile, err := os.CreateTemp("public/uploads", handler.Filename)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	defer tempFile.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
	}

	tempFile.Write(fileBytes)
	ctx.JSON(http.StatusOK, uploadImageResponse{
		ImgUrl: tempFile.Name(),
	})
}
