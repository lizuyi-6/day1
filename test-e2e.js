const { chromium } = require('playwright');
const FRONTEND_URL = 'http://localhost:5173';

(async () => {
  console.log('Starting E2E test for Aether Flow\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  try {
    // Step 1: Visit homepage
    console.log('Step 1: Visiting frontend...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log('Page loaded:', title);
    await page.screenshot({ path: 'X:/day1/test-step1-home.png' });
    console.log('Screenshot saved: test-step1-home.png');

    await page.waitForTimeout(3000);

    // Step 2: Try to navigate to workflow
    console.log('\nStep 2: Looking for workflow link...');
    const content = await page.content();

    // Check for common navigation elements
    const hasWorkflowLink = /workflow|工作流/i.test(content);
    const hasHomeLink = /home|首页/i.test(content);
    const hasChatLink = /chat|聊天/i.test(content);
    const hasKnowledgeLink = /knowledge|知识/i.test(content);

    console.log('Page analysis:');
    console.log('  - Workflow link:', hasWorkflowLink ? 'YES' : 'NO');
    console.log('  - Home link:', hasHomeLink ? 'YES' : 'NO');
    console.log('  - Chat link:', hasChatLink ? 'YES' : 'NO');
    console.log('  - Knowledge link:', hasKnowledgeLink ? 'YES' : 'NO');

    // Take final screenshot
    await page.screenshot({ path: 'X:/day1/test-step2-final.png', fullPage: true });
    console.log('\nFinal screenshot saved: test-step2-final.png');

    console.log('\n✅ Test completed successfully!');
    console.log('Browser will close in 5 seconds...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'X:/day1/test-error.png' });
    console.log('Error screenshot saved');
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
})();
