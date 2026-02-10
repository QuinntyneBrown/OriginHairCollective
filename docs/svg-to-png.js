const puppeteer = require('C:\\Users\\quinn\\AppData\\Roaming\\npm\\node_modules\\puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  const svgPath = path.resolve(__dirname, 'hair-import-tldr.svg');
  const pngPath = path.resolve(__dirname, 'hair-import-tldr.png');

  await page.setViewport({ width: 430, height: 1920, deviceScaleFactor: 2 });
  await page.goto(`file:///${svgPath.replace(/\\/g, '/')}`);

  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: pngPath,
    clip: { x: 0, y: 0, width: 430, height: 1920 }
  });

  await browser.close();
  console.log(`PNG saved to: ${pngPath}`);
})();
