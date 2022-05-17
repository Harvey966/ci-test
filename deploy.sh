echo "开始编译"
yarn build

echo "开始上传到服务器"
scp -r ./dist/* root@106.13.8.36:/usr/local/webserver/nginx/html 

echo "更新完毕"