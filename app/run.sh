#!/bin/bash
npm install -g npm@11.0.0

export PORT=8082

npm install

npm run web -- --port 8082
