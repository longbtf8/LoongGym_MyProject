const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1960, height: 1500, deviceScaleFactor: 2 });
  await page.goto('file:///Users/builong/LoongMilKGymProject/Report/schema_diagram.html', { waitUntil: 'networkidle0' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/builong/LoongMilKGymProject/Report/LoongGym_Schema_ERD_v2.png', fullPage: true });
  console.log('Screenshot saved!');
  await browser.close();
})();
