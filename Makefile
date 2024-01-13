.PHONY:
	mongo start dstart composeup composedown composepush

mongo:
	docker run -d -p 27017:27017 --name mongo --network ota mongo:latest 

dstart:
	docker run -p 8000:8000 --name ota  --network ota  ota:latest

composeup:
	docker-compose up --build --remove-orphans

composedown:
	docker-compose down --remove-orphans --rmi all

composepush:
	docker-compose push