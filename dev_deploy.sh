#!/bin/bash

cd ../dev.deploy

docker-compose stop bani-base-api
docker-compose rm -f bani-base-api

./dc-all-deploy.sh
