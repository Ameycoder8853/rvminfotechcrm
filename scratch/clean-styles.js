const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');

// Regex to match utilities with arbitrary var() variables
// Examples: text-[var(--foreground)] => text-foreground
//           bg-[var(--background)]/80 => bg-background/80
const regex = /(bg|text|border|ring|shadow)-\[var\(--([a-zA-Z0-9-]+)\)\]/g;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      cleanFile(fullPath);
    }
  });
}

function cleanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (regex.test(content)) {
    // Reset regex lastIndex
    regex.lastIndex = 0;
    const cleaned = content.replace(regex, (match, utility, varName) => {
      console.log(`  [Match] ${match} => ${utility}-${varName} in ${path.relative(srcDir, filePath)}`);
      return `${utility}-${varName}`;
    });
    fs.writeFileSync(filePath, cleaned, 'utf8');
  }
}

console.log("=== CLEANING CSS SQUARE BRACKET VARIABLES ===");
scanDir(srcDir);
console.log("=== DONE ===");
