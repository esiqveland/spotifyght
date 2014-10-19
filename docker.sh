#!/bin/bash


case "$1" in
	build) docker build -t "esiqveland/spotifyghtapi" .
		;;
	run) docker run --name spotifyghtapi --link my-redis:redis -p 127.0.0.1:3001:3001 -d  esiqveland/spotifyghtapi
		;;
	*) echo "Usage: $0 [build|run]"
		;;
esac
