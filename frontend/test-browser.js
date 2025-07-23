const puppeteer = require('puppeteer');

async function testApp() {
  console.log('🔍 Testing aplikasi umroh dengan Puppeteer...\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Enable console logging
    page.on('console', msg => {
      console.log('Browser console:', msg.type(), msg.text());
    });
    
    // Catch errors
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
    
    // Catch failed requests
    page.on('requestfailed', request => {
      console.error('Failed request:', request.url(), '-', request.failure().errorText);
    });
    
    // Monitor network
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      if (status >= 400) {
        console.error(`❌ HTTP ${status}: ${url}`);
      } else if (url.includes('/api/') || url.includes('.js') || url.includes('.css')) {
        console.log(`✅ HTTP ${status}: ${url}`);
      }
    });
    
    console.log('1. Loading homepage...');
    const response = await page.goto('https://dev-umroh-management.ezyindustries.my.id', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log(`   Status: ${response.status()}`);
    console.log(`   URL: ${page.url()}\n`);
    
    // Check if page loads correctly
    const title = await page.title();
    console.log(`2. Page title: "${title}"`);
    
    // Check for React root
    const hasRoot = await page.$('#root') !== null;
    console.log(`   React root element: ${hasRoot ? '✅ Found' : '❌ Not found'}`);
    
    // Check for any error messages
    const bodyText = await page.$eval('body', el => el.innerText);
    if (bodyText.includes('404') || bodyText.includes('error') || bodyText.includes('Error')) {
      console.log(`   ⚠️  Possible error in body: ${bodyText.substring(0, 200)}...`);
    }
    
    // Wait for React to render
    console.log('\n3. Waiting for React app to render...');
    try {
      await page.waitForSelector('input[type="text"], input[name="username"], .login-form, form', {
        timeout: 10000
      });
      console.log('   ✅ Form elements found');
    } catch (e) {
      console.log('   ❌ Form elements not found within 10 seconds');
      
      // Take screenshot
      await page.screenshot({ path: 'error-screenshot.png' });
      console.log('   📸 Screenshot saved as error-screenshot.png');
      
      // Get page HTML
      const html = await page.content();
      console.log('\n   Page HTML preview:');
      console.log(html.substring(0, 500) + '...');
    }
    
    // Check for login form
    console.log('\n4. Checking for login form...');
    const hasUsernameField = await page.$('input[name="username"], input[type="text"]') !== null;
    const hasPasswordField = await page.$('input[name="password"], input[type="password"]') !== null;
    const hasSubmitButton = await page.$('button[type="submit"], button') !== null;
    
    console.log(`   Username field: ${hasUsernameField ? '✅' : '❌'}`);
    console.log(`   Password field: ${hasPasswordField ? '✅' : '❌'}`);
    console.log(`   Submit button: ${hasSubmitButton ? '✅' : '❌'}`);
    
    // Try to login if form exists
    if (hasUsernameField && hasPasswordField) {
      console.log('\n5. Attempting login...');
      
      await page.type('input[name="username"], input[type="text"]', 'admin');
      await page.type('input[name="password"], input[type="password"]', 'admin123');
      
      // Submit form
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
        page.click('button[type="submit"], button')
      ]);
      
      // Check if logged in
      const currentUrl = page.url();
      const pageContent = await page.$eval('body', el => el.innerText);
      
      if (currentUrl.includes('dashboard') || pageContent.includes('Dashboard')) {
        console.log('   ✅ Login successful! Redirected to dashboard');
      } else if (pageContent.includes('error') || pageContent.includes('salah')) {
        console.log('   ❌ Login failed - wrong credentials');
      } else {
        console.log('   ⚠️  Login result unclear');
        console.log(`   Current URL: ${currentUrl}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
}

testApp().catch(console.error);