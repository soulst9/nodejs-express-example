#!/bin/bash

# Constants
# Constants
BASE_API_VERSION="latest"

source .env

echo "Deploy AWS Staging Server: [BASE API]"

echo "BASE API VERSION => $BASE_API_VERSION"

aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 541362444396.dkr.ecr.ap-northeast-2.amazonaws.com
echo "aws ecr login success"

docker build -t bani.base.api .
echo "docker build bani.base.api"

docker tag bani.base.api:latest 541362444396.dkr.ecr.ap-northeast-2.amazonaws.com/bani.base.api:${BASE_API_VERSION}
echo "docker tag bani.base.api:${BASE_API_VERSION}"

docker push 541362444396.dkr.ecr.ap-northeast-2.amazonaws.com/bani.base.api:${BASE_API_VERSION}
echo "docker push bani.base.api:${BASE_API_VERSION}"