const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 获取本机IP地址
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // 跳过内部IP和非IPv4地址
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // 如果找不到，返回本地回环地址
}

const PORT = process.env.PORT || 3000;
const localIp = getLocalIpAddress();

// 创建处理请求的函数
function handleRequest(req, res) {
    // 默认提供Xiaoyu.html
    let filePath = path.join(__dirname, req.url === '/' ? 'Xiaoyu.html' : req.url);
    
    // 获取文件扩展名
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    // 根据扩展名设置正确的内容类型
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }
    
    // 读取文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 页面未找到
                res.writeHead(404);
                res.end('404 - 文件未找到');
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end(`服务器错误: ${err.code}`);
            }
        } else {
            // 成功响应
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// 创建HTTP服务器
const server = http.createServer(handleRequest);

// 检查是否在Vercel环境中运行
if (process.env.VERCEL) {
    // 在Vercel中，我们需要导出处理函数
    module.exports = handleRequest;
} else {
    // 在本地环境中，启动HTTP服务器
    server.listen(PORT, () => {
        console.log(`服务器运行在:`);
        console.log(`- 本地访问: http://localhost:${PORT}`);
        console.log(`- 局域网访问: http://${localIp}:${PORT}`);
        console.log('请使用上面的地址在浏览器中访问');
        console.log('在同一局域网内的手机或其他设备可以使用局域网地址访问');
    });
} 