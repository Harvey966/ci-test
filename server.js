const http = require("http");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// 递归删除目录
function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      const curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

// const resolvePost = (req) =>
//   new Promise((resolve) => {
//     let chunk = "";
//     req.on("data", (data) => {
//       chunk += data;
//     });
//     req.on("end", () => {
//       resolve(JSON.parse(chunk));
//     });
//   });

http
  .createServer(async (req, res) => {
    console.log("receive request");
    console.log(req.url);
    if (req.method === "POST" && req.url === "/") {
      // 删除原来的代码目录
      const name = "ci-test";
      const projectDir = "./ci-test";
      deleteFolderRecursive(projectDir);

      // 拉取仓库最新代码
      execSync(
        `git clone https://github.com/Harvey966/ci-test.git ${projectDir}`,
        {
          stdio: "inherit",
        }
      );
      console.log("拉取成功");

      // 复制 Dockerfile 到项目目录
      fs.copyFileSync(
        path.resolve(`dockerfile`),
        path.resolve(projectDir, "./dockerfile")
      );

      // 复制 .dockerignore 到项目目录
      fs.copyFileSync(
        path.resolve(__dirname, `./.dockerignore`),
        path.resolve(projectDir, "./.dockerignore")
      );

      // 创建 docker 镜像
      execSync(`docker build . -t ${name}-image:latest `, {
        stdio: "inherit",
        cwd: projectDir,
      });

      // 销毁 docker 容器
      execSync(
        `docker ps -a -f "name=^${name}-container" --format="{{.Names}}" | xargs -r docker stop | xargs -r docker rm`,
        {
          stdio: "inherit",
        }
      );

      // 创建 docker 容器
      execSync(
        `docker run -d -p 8888:80 --name ${name}-container  ${name}-image:latest`,
        {
          stdio: "inherit",
        }
      );
      // docker build . -t ci-image:latest
      // docker run -d -p 8888:80 --name ci-container  ci-image:latest
    }
    res.end("ok");
  })
  .listen(3000, () => {
    console.log("server is ready");
  });
