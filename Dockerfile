FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Vite inlines import.meta.env.VITE_* into the bundle at build time, so the API
# URL is fixed when the image is built, not when the container starts. It has
# to be passed as a build arg (docker-compose.yml wires this to .env):
#   local:      http://localhost:7400/api
#   production: https://python-api.ccti.gt/api
# Rebuild the image after changing it; restarting is not enough.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine AS web
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
