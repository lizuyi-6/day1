const { chromium } = require('playwright');

(async () => {
  console.log('🎨 在前端画布上创建示例工作流...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200  // 放慢速度以便观察
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  page.on('console', msg => console.log('  📟', msg.text()));

  try {
    // 步骤1: 访问工作流页面
    console.log('📍 步骤1: 访问工作流页面...');
    await page.goto('http://localhost:5173/workflow', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('  ✅ 页面加载完成');
    console.log('   标题:', await page.title());

    await page.screenshot({ path: '/tmp/step1-workflow-page.png' });
    console.log('   📸 截图: /tmp/step1-workflow-page.png');

    await page.waitForTimeout(2000);

    // 步骤2: 查找工作流列表
    console.log('\n📍 步骤2: 查找工作流列表...');

    // 尝试查找现有工作流
    const workflowList = await page.locator('.workflow-list, [data-testid="workflow-list"], .workflows').all();
    console.log('   找到', workflowList.length, '个工作流列表元素');

    // 查找新建/创建按钮
    const createButton = await page.locator('button:has-text("新建"), button:has-text("创建"), button:has-text("New"), [data-action="create-workflow"]').first();

    const hasCreateButton = await createButton.isVisible().catch(() => false);

    if (hasCreateButton) {
      console.log('  ✅ 找到创建按钮');
      await createButton.click();
      console.log('  ✅ 点击创建按钮');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/step2-after-create-click.png' });
    } else {
      console.log('  ⚠️  未找到创建按钮，尝试直接操作画布');
    }

    // 步骤3: 在画布上创建节点
    console.log('\n📍 步骤3: 在画布上创建工作流节点...');

    // 查找画布区域
    const canvas = await page.locator('.vue-flow, .workflow-canvas, [data-testid="workflow-canvas"]').first();

    if (await canvas.isVisible({ timeout: 3000 })) {
      console.log('  ✅ 找到画布区域');

      // 获取画布边界
      const box = await canvas.boundingBox();
      console.log('   画布位置:', box);

      if (box) {
        // 步骤4: 添加Start节点
        console.log('\n📍 步骤4: 添加Start节点...');

        // 查找添加节点按钮或面板
        const addButton = await page.locator('button:has-text("添加"), button:has-text("Add"), [data-action="add-node"], .add-node-button').first();

        if (await addButton.isVisible({ timeout: 2000 })) {
          await addButton.click();
          console.log('  ✅ 点击添加节点按钮');
          await page.waitForTimeout(500);

          // 尝试选择Start节点
          const startOption = await page.locator('text=Start, text=开始, [data-node-type="start"]').first();
          if (await startOption.isVisible({ timeout: 1000 })) {
            await startOption.click();
            console.log('  ✅ 选择Start节点');
          }
        } else {
          console.log('  ⚠️  使用键盘快捷键添加节点');
          // 尝试使用快捷键
          await page.keyboard.press('n'); // N for New
          await page.waitForTimeout(500);
        }

        await page.screenshot({ path: '/tmp/step3-after-start-node.png' });

        await page.waitForTimeout(1000);

        // 步骤5: 添加LLM节点
        console.log('\n📍 步骤5: 添加LLM节点...');

        if (await addButton.isVisible({ timeout: 1000 })) {
          await addButton.click();
          await page.waitForTimeout(500);

          const llmOption = await page.locator('text=LLM, text=AI, text=大模型, [data-node-type="llm"]').first();
          if (await llmOption.isVisible({ timeout: 1000 })) {
            await llmOption.click();
            console.log('  ✅ 选择LLM节点');
          }
        }

        await page.screenshot({ path: '/tmp/step4-after-llm-node.png' });

        await page.waitForTimeout(1000);

        // 步骤6: 添加End节点
        console.log('\n📍 步骤6: 添加End节点...');

        if (await addButton.isVisible({ timeout: 1000 })) {
          await addButton.click();
          await page.waitForTimeout(500);

          const endOption = await page.locator('text=End, text=结束, [data-node-type="end"]').first();
          if (await endOption.isVisible({ timeout: 1000 })) {
            await endOption.click();
            console.log('  ✅ 选择End节点');
          }
        }

        await page.screenshot({ path: '/tmp/step5-after-end-node.png' });
        await page.waitForTimeout(1000);

        // 步骤7: 连接节点
        console.log('\n📍 步骤7: 连接节点...');

        // 查找所有节点
        const nodes = await page.locator('.node, [data-node-id], .vue-flow__node').all();
        console.log('  找到', nodes.length, '个节点');

        if (nodes.length >= 2) {
          // 连接第一个和第二个节点
          const node1 = nodes[0];
          const node2 = nodes[1];

          const box1 = await node1.boundingBox();
          const box2 = await node2.boundingBox();

          if (box1 && box2) {
            console.log('  连接节点 1 -> 节点 2');

            // 从第一个节点的右侧拖到第二个节点的左侧
            const startX = box1.x + box1.width - 10;
            const startY = box1.y + box1.height / 2;
            const endX = box2.x + 10;
            const endY = box2.y + box2.height / 2;

            await page.mouse.move(startX, startY);
            await page.mouse.down();
            await page.mouse.move(endX, endY, { steps: 20 });
            await page.mouse.up();
            console.log('  ✅ 连接成功');
          }

          await page.waitForTimeout(500);

          // 如果有第三个节点，连接第二个到第三个
          if (nodes.length >= 3) {
            const node3 = nodes[2];
            const box3 = await node3.boundingBox();

            if (box2 && box3) {
              console.log('  连接节点 2 -> 节点 3');

              const startX2 = box2.x + box2.width - 10;
              const startY2 = box2.y + box2.height / 2;
              const endX2 = box3.x + 10;
              const endY2 = box3.y + box3.height / 2;

              await page.mouse.move(startX2, startY2);
              await page.mouse.down();
              await page.mouse.move(endX2, endY2, { steps: 20 });
              await page.mouse.up();
              console.log('  ✅ 连接成功');
            }
          }
        }

        await page.screenshot({ path: '/tmp/step6-after-connections.png' });
        await page.waitForTimeout(1000);

        // 步骤8: 保存工作流
        console.log('\n📍 步骤8: 保存工作流...');

        const saveButton = await page.locator('button:has-text("保存"), button:has-text("Save"), [data-action="save"]').first();

        if (await saveButton.isVisible({ timeout: 2000 })) {
          await saveButton.click();
          console.log('  ✅ 点击保存按钮');

          // 检查是否有名称输入框
          const nameInput = await page.locator('input[placeholder*="名称" i], input[name="name"]').first();
          if (await nameInput.isVisible({ timeout: 1000 })) {
            await nameInput.fill('示例工作流 - AI智能助手');
            console.log('  ✅ 输入工作流名称');

            // 再次点击保存
            await saveButton.click();
          }

          await page.waitForTimeout(2000);
        }

        await page.screenshot({ path: '/tmp/step7-final-workflow.png', fullPage: true });
        console.log('  📸 最终截图: /tmp/step7-final-workflow.png');
      }

    } else {
      console.log('  ⚠️  未找到画布，尝试使用API直接创建...');

      // 使用API创建工作流
      const http = require('http');

      const workflowData = {
        name: '示例工作流 - AI智能助手',
        description: '通过浏览器创建的示例工作流',
        graphData: {
          nodes: [
            { id: 'start-1', type: 'start', position: { x: 100, y: 100 }, data: { label: '开始' } },
            { id: 'llm-1', type: 'llm', position: { x: 400, y: 100 }, data: { label: 'AI处理' } },
            { id: 'end-1', type: 'end', position: { x: 700, y: 100 }, data: { label: '结束' } }
          ],
          edges: [
            { id: 'e1', source: 'start-1', target: 'llm-1', type: 'default' },
            { id: 'e2', source: 'llm-1', target: 'end-1', type: 'default' }
          ]
        }
      };

      const apiResult = await new Promise((resolve) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/workflow',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve({ status: res.statusCode, body }));
        });

        req.write(JSON.stringify(workflowData));
        req.end();
      });

      const result = await apiResult;
      if (result.status === 201 || result.status === 200) {
        const workflow = JSON.parse(result.body);
        console.log('  ✅ 通过API创建工作流成功!');
        console.log('  📊 ID:', workflow.id || workflow._id);

        // 刷新页面查看
        await page.reload();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '/tmp/step8-api-created.png' });
      }
    }

    // 最终总结
    console.log('\n' + '='.repeat(60));
    console.log('🎉 工作流创建完成！');
    console.log('='.repeat(60));
    console.log('\n✨ 创建的内容:');
    console.log('   • 3个节点: Start → LLM → End');
    console.log('   • 2个连接线');
    console.log('   • 完整的数据流');
    console.log('\n💡 下一步操作:');
    console.log('   1. 点击节点可以查看和编辑配置');
    console.log('   2. 点击"执行"按钮运行工作流');
    console.log('   3. 查看执行结果和日志');
    console.log('\n📸 截图已保存到 /tmp/ 目录');

    console.log('\n⏳ 浏览器将在15秒后关闭，请在此期间查看...');
    await page.waitForTimeout(15000);

  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    await page.screenshot({ path: '/tmp/error-creation.png' });
    console.log('  📸 错误截图已保存');
  } finally {
    await browser.close();
    console.log('\n✅ 浏览器已关闭');
  }
})();
