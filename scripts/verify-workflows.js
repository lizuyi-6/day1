
// Native fetch is available in Node.js 18+
// const fetch = require('node-fetch');

// Mock browser ID generation
function generateBrowserId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const API_URL = 'http://localhost:3001';
const BROWSER_ID = generateBrowserId();

async function checkWorkflows() {
  console.log('🔍 Checking workflows...');
  console.log(`🌐 API URL: ${API_URL}`);
  console.log(`🆔 Browser ID: ${BROWSER_ID}`);

  try {
    const response = await fetch(`${API_URL}/workflow?limit=50`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Browser-Id': BROWSER_ID
      }
    });

    if (response.status === 401) {
        console.error('❌ Authentication failed (401). Headers:', response.headers);
        return;
    }

    const data = await response.json();
    console.log('📥 Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(data, null, 2));

    if (data.success && data.data && data.data.items) {
        console.log(`✅ Found ${data.data.items.length} workflows.`);
        data.data.items.forEach(wf => {
            console.log(`   - [${wf.id}] ${wf.name} (Updated: ${wf.updatedAt})`);
        });
    } else {
        console.warn('⚠️ No workflows found or unexpected structure.');
    }

  } catch (error) {
    console.error('❌ Error fetching workflows:', error.message);
  }
}

checkWorkflows();
