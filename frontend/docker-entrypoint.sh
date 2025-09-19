#!/bin/sh

# Docker entrypoint script for frontend
# Handles environment variable injection for React apps

# Environment variables file
ENV_FILE="/usr/share/nginx/html/env.js"

# Generate environment configuration
cat > $ENV_FILE << EOF
window.env = {
  REACT_APP_API_URL: "${REACT_APP_API_URL:-http://localhost:3000}",
  REACT_APP_ENVIRONMENT: "${REACT_APP_ENVIRONMENT:-production}",
  REACT_APP_VERSION: "${REACT_APP_VERSION:-1.0.0}",
  REACT_APP_GOOGLE_MAPS_API_KEY: "${REACT_APP_GOOGLE_MAPS_API_KEY:-}",
  REACT_APP_WEBSOCKET_URL: "${REACT_APP_WEBSOCKET_URL:-ws://localhost:3000}"
};
EOF

echo "Environment configuration generated:"
cat $ENV_FILE

# Start nginx
exec "$@"