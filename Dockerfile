# Stage 1: Build the application
FROM node:16-alpine as build-stage

WORKDIR /app

# Install dependencies
COPY package.json package.json
COPY .env .env
RUN npm install

# Copy the rest of the files
COPY . .

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Run envsubst to replace environment variables in index.html.template
RUN envsubst < public/index.html.template > public/index.html

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built application from the build stage
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]