#!/usr/bin/env bash
set -euo pipefail

APP_ENV="${REACT_APP_ENV:-staging}"

echo "Preparing environment: ${APP_ENV}"

set -a
. "config/${APP_ENV}/.${APP_ENV}.env"
set +a



echo "Copying signing certificate"
cp config/${APP_ENV}/Funder.keystore \
    android/app/Funder.keystore


echo "Updating JS configuration files"
envsubst < config/config.model > config/config.js
