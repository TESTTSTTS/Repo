# Базовый этап для разработки и продакшена
FROM node:16-alpine as base
WORKDIR /app
COPY package*.json ./

# Этап разработки
FROM base as development
ENV NODE_ENV=development
RUN npm install
RUN npm install react-icons --save
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Этап сборки
FROM base as build
ENV NODE_ENV=production
RUN npm install
RUN npm install react-icons --save
COPY . .
RUN npm run build

# Этап продакшена
FROM nginx:alpine as production
COPY --from=build /app/build /usr/share/nginx/html
RUN mkdir -p /usr/share/nginx/html/images
COPY public/images/*.svg /usr/share/nginx/html/images/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
