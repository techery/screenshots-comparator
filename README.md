# Screenshots Comparator

MVP of the cross-browser screenshot comparison tool

## Installation & Running

1. `npm install` to install dependencies
2. `node index.mjs 'path/to/screenshots'` to run tool

## Hints

- Screenshots are copied to the report/data folder
- The tool saves report to `report/index.html`
- You can pass custom comparison threshold (0-1) as a second argument
- Valid screenshot name suffixes: 
  - `-chromium.png`
  - `-firefox.png`
  - `-webkit.png`
