// 简单的浏览器检查脚本 - 使用 Puppeteer
const http = require('http');

console.log('🔍 检查前端开发服务器...\n');

// 检查前端服务器
const checkFrontend = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:5173', (res) => {
      console.log('✅ 前端服务器运行中 (http://localhost:5173)');
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📄 前端响应长度:', data.length);
        // 检查是否包含 Vue 应用挂载点
        if (data.includes('<div id="app">')) {
          console.log('✅ 找到 Vue 应用挂载点 (#app)');
        } else {
          console.log('❌ 未找到 Vue 应用挂载点');
        }
        resolve(true);
      });
    }).on('error', (err) => {
      console.error('❌ 前端服务器连接失败:', err.message);
      resolve(false);
    });
  });
};

// 检查后端 API
const checkBackend = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/workflow?page=1&limit=5&status=published', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('\n✅ 后端 API 正常');
          console.log('📊 API 返回:', {
            success: json.success,
            total: json.data?.total,
            items: json.data?.items?.length
          });
          resolve(true);
        } catch (e) {
          console.error('❌ API 响应解析失败:', e.message);
          console.log('原始响应:', data.substring(0, 200));
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.error('❌ 后端服务器连接失败:', err.message);
      resolve(false);
    });
  });
};

// 主函数
(async () => {
  console.log('========================================');
  console.log('   Aether Flow 诊断工具');
  console.log('========================================\n');

  const frontendOk = await checkFrontend();
  const backendOk = await checkBackend();

  console.log('\n========================================');
  console.log('   诊断结果');
  console.log('========================================\n');

  console.log(`前端服务器: ${frontendOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`后端 API:    ${backendOk ? '✅ 正常' : '❌ 异常'}`);

  if (frontendOk && backendOk) {
    console.log('\n✅ 服务器都正常运行！');
    console.log('\n🔍 建议手动检查：');
    console.log('   1. 打开浏览器访问 http://localhost:5173/chat');
    console.log('   2. 按 F12 打开开发者工具');
    console.log('   3. 查看 Console 标签是否有错误');
    console.log('   4. 查看 Network 标签，找到 /workflow 请求');
    console.log('   5. 检查该请求的 Response 是否包含数据');
  } else {
    console.log('\n❌ 服务器存在问题，请检查：');
    if (!frontendOk) {
      console.log('   - 前端服务器是否启动？(npm run dev)');
      console.log('   - 端口 5173 是否被占用？');
    }
    if (!backendOk) {
      console.log('   - 后端服务器是否启动？(npm run start:dev)');
      console.log('   - 端口 3001 是否正确？');
    }
  }
})();
