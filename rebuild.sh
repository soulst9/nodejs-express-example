#!/bin/bash

docker image prune -f

./dc-build.sh 0.0.1
