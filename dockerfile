# dockerfile
# build stage 
# 打包构建阶段
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

# nginx配置阶段，把上一个阶段的产物放到nginx的web目录中
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
