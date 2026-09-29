import { chromium } from 'playwright';

async function capture() {
  console.log('Launching Chromium...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1.5 // 1.5x resolution for retina sharpness
  });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // 1. Wait 3.5s for 3D Scene WebGL to settle in LED mode
  console.log('Rendering 5000K Smart LED Mode...');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'LED_Solutions_3D_LED_5000K.png' });
  console.log('Saved LED_Solutions_3D_LED_5000K.png');

  // 2. Click 400W Metal Halide mode
  console.log('Switching to 400W Metal Halide mode...');
  await page.click('button[data-mode="halide"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'LED_Solutions_3D_Halide_Comparison.png' });
  console.log('Saved LED_Solutions_3D_Halide_Comparison.png');

  // 3. Click AS/NZS 1680 Lux CAD Heatmap mode
  console.log('Switching to Photometric Lux CAD Heatmap mode...');
  await page.click('button[data-mode="heatmap"]');
  await page.click('button[data-cam="cad"]'); // switch to top-down CAD view!
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'LED_Solutions_3D_Heatmap_CAD.png' });
  console.log('Saved LED_Solutions_3D_Heatmap_CAD.png');

  // 4. Switch back to LED mode and capture full-page scrolling layout
  console.log('Capturing Full-Page Complete Landing Experience...');
  await page.click('button[data-mode="led"]');
  await page.click('button[data-cam="overview"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'LED_Solutions_Full_Page_Experience.png', fullPage: true });
  console.log('Saved LED_Solutions_Full_Page_Experience.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
