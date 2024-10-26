#!/bin/bash

# Constants
VERSION=""

# Usage
case $# in
    1)
    VERSION="$1"
    ;;

    *)
    echo "Usage: $0 <VERSION>"
    echo "-----------------------------------------------"
    echo "  - VERSION: x.x.x"
    exit -1
    ;;
esac

# Deploy
docker build -t bani/base-api:${VERSION} .
