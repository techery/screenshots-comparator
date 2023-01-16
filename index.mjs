import { writeFileSync, readFileSync, readdirSync, copyFileSync } from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const screenshotsDir = process.argv[2];
const threshold = +(process.argv[3] ?? 0.1);
const reportDir = './report';
const reportDataDir = `${reportDir}/data`;

const getHtml = body => 
  `<!DOCTYPE html>
  <html>
  <head><title>Screenshots Comparator</title><link rel="stylesheet" href="styles.css" /></head>
  <body>${body}</body>
  </html>`;

const getColumn = (title, imagePath) =>
  `<div class="column">
    ${title}
    <a href=${imagePath} target="_blank">
      <img src=${imagePath}>
    </a>
  </div>`;

// Get array with full screenshot names
const images = readdirSync(screenshotsDir).filter(name => name.endsWith('.png'));

// Copy screenshots to report data dir
images.forEach(img => copyFileSync(`${screenshotsDir}/${img}`, `${reportDataDir}/${img}`));

// Get array with name of pages
const pages = [...new Set(images.map(name => name.replace(/-\w+\.png$/, '')))];

// Compare images
pages.forEach(name => {
  const imgChromium = PNG.sync.read(readFileSync(`${reportDataDir}/${name}-chromium.png`));
  const imgFirefox = PNG.sync.read(readFileSync(`${reportDataDir}/${name}-firefox.png`));
  const imgWebkit = PNG.sync.read(readFileSync(`${reportDataDir}/${name}-webkit.png`));

  const { width, height } = imgChromium;
  const chromiumFirefoxDiff = new PNG({ width, height });
  const chromiumWebKitDiff = new PNG({ width, height });

  pixelmatch(imgChromium.data, imgFirefox.data, chromiumFirefoxDiff.data, width, height, { threshold });
  pixelmatch(imgChromium.data, imgWebkit.data, chromiumWebKitDiff.data, width, height, { threshold });

  writeFileSync(`${reportDataDir}/${name}-chromium-firefox-diff.png`, PNG.sync.write(chromiumFirefoxDiff));
  writeFileSync(`${reportDataDir}/${name}-chromium-webkit-diff.png`, PNG.sync.write(chromiumWebKitDiff));
});

// Generate HTML report
const body = pages.map(name =>
  `<h3>Page ${name}</h3>
  <div class="row">
    ${getColumn('Chrome', `data/${name}-chromium.png`)}
    ${getColumn('Firefox', `data/${name}-firefox.png`)}
    ${getColumn('Diff', `data/${name}-chromium-firefox-diff.png`)}
  </div>
  <div class="row">
    ${getColumn('Chrome', `data/${name}-chromium.png`)}
    ${getColumn('Safari', `data/${name}-webkit.png`)}
    ${getColumn('Diff', `data/${name}-chromium-webkit-diff.png`)}
  </div>`
);

writeFileSync(`${reportDir}/index.html`, getHtml(body.join('')));
