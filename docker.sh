#!/bin/bash

PROJECT=esiqveland/spotifyghtapi

case "$1" in
	build) docker build -t "$PROJECT" .
		;;
	run) docker run --name spotifyghtapi --link my-redis:redis -p 127.0.0.1:3001:3001 -d $PROJECT
		;;
	login) docker login -e "${DOCKER_EMAIL}" -u "${DOCKER_USER}" -p "${DOCKER_PASS}"
		;;
	pull) docker pull $PROJECT
		;;
	push) docker push $PROJECT
		;;
	*) echo "Usage: $0 [build|run]"
		;;
esac
