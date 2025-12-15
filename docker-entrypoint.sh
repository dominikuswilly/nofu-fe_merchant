#!/bin/sh

# Recreate config.js
echo "window.config = {" > /app/dist/config.js
echo "  VUE_APP_BACKEND_URL: \"$VUE_APP_BACKEND_URL\"," >> /app/dist/config.js
echo "  NODE_ENV: \"$NODE_ENV\"" >> /app/dist/config.js
echo "};" >> /app/dist/config.js

# Execute the CMD
exec "$@"
