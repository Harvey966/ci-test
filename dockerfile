# 打包构建阶段
FROM node:lts-alpine as build-stage
WORKDIR /app
# 复制当前代码到
COPY . .
# 安装依赖
RUN yarn
# 打包
RUN yarn build

# nginx配置阶段，把上一个阶段的产物放到nginx的web目录中
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# 暴露80端口
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]