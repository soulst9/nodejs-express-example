#!/bin/bash

npx sequelize db:migrate --env operation
npx sequelize db:seed:all --env operation
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 30
yarn start
