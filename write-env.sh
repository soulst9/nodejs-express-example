#!/bin/bash

if [ -z "$1" ]; then
  echo "잘못된 명령어입니다."
  exit 1
  
elif [ "$1" == "staging" ]; then
    if [ -z "$2" ]; then
        echo "환경을 입력하세요."
        exit 1
    fi
    
    echo "STAGING_$2=$3" >> .env
    fi

elif [ "$1" == "production" ]; then
    if [ -z "$2" ]; then
        echo "환경을 입력하세요."
        exit 1
    fi
    
    echo "PRODUCTION_$2=$3" >> .env
fi