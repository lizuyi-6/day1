const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    devtools: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.error(`[Browser Error] ${error.message}`);
  });

  // 监听网络请求
  page.on('request', request => {
    if (request.url().includes('workflow')) {
      console.log(`[Network Request] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('workflow')) {
      console.log(`[Network Response] ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('🚀 正在打开浏览器...\n');

    // 访问 chat 页面
    console.log('📍 访问 http://localhost:5173/chat');
    await page.goto('http://localhost:5173/chat', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('\n✅ 页面加载完成\n');

    // 等待一下，让 Vue 应用完全挂载
    await page.waitForTimeout(3000);

    // 检查页面 URL
    const url = page.url();
    console.log(`📍 当前 URL: ${url}`);

    // 检查页面标题
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);

    // 检查路由
    const path = await page.evaluate(() => {
      return window.location.pathname;
    });
    console.log(`📍 路由路径: ${path}`);

    // 检查 Vue 实例
    const vueInfo = await page.evaluate(() => {
      const app = document.querySelector('#app');
      return {
        hasApp: !!app,
        appInnerHTML: app ? app.innerHTML.substring(0, 200) : null
      };
    });
    console.log('\n🔍 Vue 应用信息:', JSON.stringify(vueInfo, null, 2));

    // 截图
    const screenshotPath = 'chat-page-screenshot.png';
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    console.log(`\n📸 截图已保存: ${screenshotPath}`);

    // 检查是否有工作流列表
    const hasWorkflows = await page.evaluate(() => {
      const sidebar = document.querySelector('aside');
      if (!sidebar) return { found: false, reason: 'No sidebar' };

      const agents = sidebar.querySelectorAll('[class*="agent"]');
      return {
        found: agents.length > 0,
        count: agents.length,
        sidebarHTML: sidebar.innerHTML.substring(0, 500)
      };
    });

    console.log('\n📊 工作流列表检查:', JSON.stringify(hasWorkflows, null, 2));

    // 检查网络请求
    console.log('\n🌐 检查 API 请求...');

    // 触发一次手动 API 请求检查
    const apiCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/workflow?page=1&limit=5&status=published');
        const data = await response.json();
        return {
          success: response.ok,
          status: response.status,
          data: data
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log('📡 API 直接请求结果:', JSON.stringify(apiCheck, null, 2));

    console.log('\n⏸️  浏览器将保持打开 30 秒，请手动检查...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ 浏览器已关闭');
  }
})();
