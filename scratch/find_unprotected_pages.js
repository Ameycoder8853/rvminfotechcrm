const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, '..', 'src', 'app', '(dashboard)');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file === 'page.tsx') {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasUsePermission = content.includes('usePermission');
      const relPath = path.relative(dashboardDir, fullPath);
      console.log(`${relPath}: ${hasUsePermission ? 'PROTECTED' : 'UNPROTECTED'}`);
    }
  }
}

scanDir(dashboardDir);
