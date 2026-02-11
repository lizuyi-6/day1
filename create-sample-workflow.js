const http = require('http');

// API配置
const API_BASE = 'http://localhost:3001';
const EMAIL = 'demo@aetherflow.com';
const PASSWORD = 'Demo123456!';

// 工作流数据
const sampleWorkflow = {
  name: '示例工作流 - AI助手',
  description: '一个简单的工作流示例，展示如何使用LLM节点创建AI助手',
  graphData: {
    nodes: [
      {
        id: 'node-start-001',
        type: 'start',
        position: { x: 100, y: 100 },
        data: {
          label: '开始',
          variables: {
            userQuestion: '你好，请介绍一下你自己'
          }
        }
      },
      {
        id: 'node-llm-001',
        type: 'llm',
        position: { x: 400, y: 100 },
        data: {
          label: 'LLM处理',
          config: {
            prompt: '你是一个友好的AI助手。请回答用户的问题：{{userQuestion}}',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 500
          }
        }
      },
      {
        id: 'node-end-001',
        type: 'end',
        position: { x: 700, y: 100 },
        data: {
          label: '结束',
          outputMapping: {
            response: 'llmResponse'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-start-llm',
        source: 'node-start-001',
        target: 'node-llm-001',
        type: 'default'
      },
      {
        id: 'edge-llm-end',
        source: 'node-llm-001',
        target: 'node-end-001',
        type: 'default'
      }
    ]
  }
};

// HTTP请求辅助函数
function makeRequest(method, path, data = null, token = null) {
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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
  console.log('🚀 开始创建示例工作流...\n');

  try {
    // 步骤1: 注册或登录
    console.log('📍 步骤1: 用户登录...');
    let loginResult = await makeRequest('POST', '/auth/login', {
      email: EMAIL,
      password: PASSWORD
    });

    // 如果登录失败，先注册
    if (loginResult.status === 404 || loginResult.status === 401) {
      console.log('  ⚠️  用户不存在，先注册...');
      const registerResult = await makeRequest('POST', '/auth/register', {
        email: EMAIL,
        password: PASSWORD,
        name: 'Demo User'
      });

      if (registerResult.status === 201 || registerResult.status === 200) {
        console.log('  ✅ 用户注册成功');
        // 注册后登录
        loginResult = await makeRequest('POST', '/auth/login', {
          email: EMAIL,
          password: PASSWORD
        });
      }
    }

    if (loginResult.status === 200 || loginResult.status === 201) {
      console.log('  ✅ 登录成功');
      const token = loginResult.data.access_token;

      if (!token) {
        throw new Error('未获取到access token');
      }

      console.log('  📝 Token:', token.substring(0, 20) + '...');

      // 步骤2: 创建工作流
      console.log('\n📍 步骤2: 创建示例工作流...');
      const createResult = await makeRequest('POST', '/workflow', sampleWorkflow, token);

      if (createResult.status === 201 || createResult.status === 200) {
        const workflow = createResult.data;
        console.log('  ✅ 工作流创建成功！');
        console.log('\n📊 工作流信息:');
        console.log('   ID:', workflow.id || workflow._id);
        console.log('   名称:', workflow.name);
        console.log('   描述:', workflow.description);
        console.log('   节点数:', sampleWorkflow.graphData.nodes.length);
        console.log('   连接数:', sampleWorkflow.graphData.edges.length);

        // 步骤3: 获取所有工作流验证
        console.log('\n📍 步骤3: 验证工作流已保存...');
        const getResult = await makeRequest('GET', '/workflow', null, token);

        if (getResult.status === 200) {
          const workflows = getResult.data.items || getResult.data;
          console.log('  ✅ 当前系统中的工作流数量:', workflows.length);

          const ourWorkflow = workflows.find(w =>
            w.name === sampleWorkflow.name ||
            w.id === (workflow.id || workflow._id)
          );

          if (ourWorkflow) {
            console.log('  ✅ 示例工作流已成功保存到数据库！');
          }
        }

        // 步骤4: 测试执行工作流
        console.log('\n📍 步骤4: 测试执行工作流...');
        const workflowId = workflow.id || workflow._id;
        const execResult = await makeRequest('POST', `/workflow/${workflowId}/run`, {
          inputs: {
            userQuestion: '你好，请介绍一下你自己'
          }
        }, token);

        if (execResult.status === 200 || execResult.status === 201) {
          console.log('  ✅ 工作流执行成功！');
          console.log('\n📄 执行结果:');
          console.log(JSON.stringify(execResult.data, null, 2));
        } else {
          console.log('  ⚠️  工作流执行返回:', execResult.status);
          console.log('     响应:', execResult.data);
        }

        // 总结
        console.log('\n' + '='.repeat(60));
        console.log('🎉 示例工作流创建完成！');
        console.log('='.repeat(60));
        console.log('\n📋 工作流详情:');
        console.log(`   名称: ${sampleWorkflow.name}`);
        console.log(`   ID: ${workflowId}`);
        console.log(`   节点: Start → LLM → End`);
        console.log(`   功能: 演示如何使用LLM节点`);
        console.log('\n💡 提示: 你可以访问 http://localhost:5173/workflow');
        console.log('         在前端界面查看和编辑这个工作流');
        console.log('\n' + '='.repeat(60));

        // 保存工作流ID到文件
        require('fs').writeFileSync(
          'X:/day1/SAMPLE_WORKFLOW_ID.txt',
          `Workflow ID: ${workflowId}\nName: ${sampleWorkflow.name}\n\n` +
          `Created: ${new Date().toISOString()}\n` +
          `Email: ${EMAIL}\n`
        );
        console.log('📁 工作流ID已保存到: X:/day1/SAMPLE_WORKFLOW_ID.txt');

      } else {
        console.log('  ❌ 工作流创建失败:', createResult.status);
        console.log('     错误:', createResult.data);
      }

    } else {
      console.log('  ❌ 登录失败:', loginResult.status);
      console.log('     响应:', loginResult.data);
    }

  } catch (error) {
    console.error('\n❌ 发生错误:', error.message);
    console.error('   堆栈:', error.stack);
  }
}

// 执行
createSampleWorkflow();
