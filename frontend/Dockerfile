# Use nginx to serve static files
FROM nginx:alpine

# Copy frontend files to nginx's default directory
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Expose port 80
# nginx starts automatically with the base image
