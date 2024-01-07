package api

import (
	"io"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type uploadImageRequest struct {
	File *multipart.FileHeader `form:"uploadFile"`
}
type uploadImageResponse struct {
	ImgUrl string `json:"imgUrl"`
}

func (s *Server) uploadImage(ctx *gin.Context) {
	var request uploadImageRequest
	if err := ctx.ShouldBind(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// accepts only up to 3 MB
	ctx.Request.ParseMultipartForm(3 << 20)

	file, handler, err := ctx.Request.FormFile("uploadFile")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	defer file.Close()

	tempFile, err := os.CreateTemp("public/uploads", handler.Filename)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	defer tempFile.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	tempFile.Write(fileBytes)
	ctx.JSON(http.StatusOK, uploadImageResponse{
		ImgUrl: tempFile.Name(),
	})
}
