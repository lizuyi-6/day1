const http = require('http');

// API配置
const API_BASE = 'http://localhost:3001';

// 简化的工作流数据（不需要认证）
const sampleWorkflow = {
  name: '示例工作流 - AI智能助手',
  description: '演示如何使用LLM节点创建一个简单的AI对话助手',
  graphData: {
    nodes: [
      {
        id: 'start-node',
        type: 'start',
        position: { x: 100, y: 150 },
        data: {
          label: '开始',
          variables: {
            userInput: '请介绍一下你自己'
          }
        }
      },
      {
        id: 'llm-node',
        type: 'llm',
        position: { x: 400, y: 150 },
        data: {
          label: 'AI处理',
          config: {
            prompt: '你是一个友好的AI助手。请回答：{{userInput}}',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 500
          }
        }
      },
      {
        id: 'end-node',
        type: 'end',
        position: { x: 700, y: 150 },
        data: {
          label: '结束',
          outputMapping: {
            response: 'aiResponse'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'start-node',
        target: 'llm-node',
        type: 'default',
        animated: true
      },
      {
        id: 'edge-2',
        source: 'llm-node',
        target: 'end-node',
        type: 'default',
        animated: true
      }
    ]
  }
};

// HTTP请求辅助函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function createSampleWorkflow() {
  console.log('🚀 创建示例工作流（无需认证版本）\n');
  console.log('='.repeat(60));

  try {
    // 步骤1: 创建工作流
    console.log('\n📍 步骤1: 创建示例工作流...');
    const createResult = await makeRequest('POST', '/workflow', sampleWorkflow);

    if (createResult.status === 201 || createResult.status === 200) {
      const workflow = createResult.data;
      const workflowId = workflow.id || workflow._id;

      console.log('  ✅ 工作流创建成功！');
      console.log('\n📊 工作流信息:');
      console.log('   ├─ ID:', workflowId);
      console.log('   ├─ 名称:', workflow.name);
      console.log('   ├─ 描述:', workflow.description);
      console.log('   ├─ 节点数:', sampleWorkflow.graphData.nodes.length);
      console.log('   └─ 连接数:', sampleWorkflow.graphData.edges.length);

      console.log('\n📋 节点详情:');
      sampleWorkflow.graphData.nodes.forEach((node, index) => {
        console.log(`   ${index + 1}. ${node.data.label} (${node.type})`);
      });

      // 步骤2: 验证工作流已保存
      console.log('\n📍 步骤2: 验证工作流已保存...');
      const getResult = await makeRequest('GET', '/workflow');

      if (getResult.status === 200) {
        const workflows = getResult.data.items || getResult.data;
        console.log('  ✅ 当前系统工作流总数:', workflows.length);

        const savedWorkflow = Array.isArray(workflows)
          ? workflows.find(w => (w.id || w._id) === workflowId)
          : workflows;

        if (savedWorkflow) {
          console.log('  ✅ 示例工作流已成功保存到数据库！');
        }
      }

      // 步骤3: 显示工作流JSON
      console.log('\n📍 步骤3: 工作流完整数据...');
      console.log(JSON.stringify(workflow, null, 2));

      // 步骤4: 保存到文件
      const fs = require('fs');
      const workflowInfo = {
        id: workflowId,
        name: sampleWorkflow.name,
        description: sampleWorkflow.description,
        created: new Date().toISOString(),
        graphData: sampleWorkflow.graphData
      };

      fs.writeFileSync(
        'X:/day1/SAMPLE_WORKFLOW.json',
        JSON.stringify(workflowInfo, null, 2)
      );
      console.log('\n  📁 工作流数据已保存到: X:/day1/SAMPLE_WORKFLOW.json');

      // 保存ID
      fs.writeFileSync(
        'X:/day1/SAMPLE_WORKFLOW_ID.txt',
        `工作流ID: ${workflowId}\n` +
        `名称: ${sampleWorkflow.name}\n` +
        `创建时间: ${new Date().toISOString()}\n\n` +
        `查看方式:\n` +
        `1. 访问前端: http://localhost:5173/workflow\n` +
        `2. 使用ID查询: ${workflowId}\n` +
        `3. 或查看文件: X:/day1/SAMPLE_WORKFLOW.json\n`
      );
      console.log('  📁 工作流ID已保存到: X:/day1/SAMPLE_WORKFLOW_ID.txt');

      // 总结
      console.log('\n' + '='.repeat(60));
      console.log('🎉 示例工作流创建成功！');
      console.log('='.repeat(60));
      console.log('\n✨ 工作流特性:');
      console.log('   • 3个节点: Start → LLM → End');
      console.log('   • 1个AI处理节点，配置了友好的助手prompt');
      console.log('   • 2个连接，展示数据流向');
      console.log('   • 完整的配置示例，可作为模板使用');

      console.log('\n💡 如何使用:');
      console.log('   1. 访问前端界面: http://localhost:5173/workflow');
      console.log(`   2. 查找工作流ID: ${workflowId}`);
      console.log('   3. 点击"执行"按钮运行工作流');
      console.log('   4. 或通过API执行: POST /workflow/' + workflowId + '/run');

      console.log('\n📚 相关文件:');
      console.log('   • X:/day1/SAMPLE_WORKFLOW.json - 完整工作流数据');
      console.log('   • X:/day1/SAMPLE_WORKFLOW_ID.txt - 工作流ID和使用说明');
      console.log('   • X:/day1/create-sample-workflow.js - 创建脚本');

      console.log('\n' + '='.repeat(60));

    } else {
      console.log('  ❌ 工作流创建失败:', createResult.status);
      console.log('     错误详情:', createResult.data);
    }

  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    console.error('   堆栈:', error.stack);
  }
}

// 执行
createSampleWorkflow();
