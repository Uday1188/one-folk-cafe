const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname);
const frontendDir = path.join(rootDir, 'frontend');
const appDir = path.join(frontendDir, 'src', 'app');
const backupDir = path.join(rootDir, '.customer_backup');
const adminUiDir = path.join(rootDir, 'admin-desktop', 'ui');
const adminResourcesFrontendDir = path.join(rootDir, 'admin-desktop', 'resources', 'frontend');

const customerItems = ['menu', 'product', 'HomeClient.tsx', 'page.tsx', 'robots.ts', 'sitemap.ts'];

console.log('=== STEP 1: Staging Customer Routes ===');
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true });
}
fs.mkdirSync(backupDir, { recursive: true });

for (const item of customerItems) {
  const src = path.join(appDir, item);
  const dest = path.join(backupDir, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    fs.rmSync(src, { recursive: true, force: true });
    console.log(`  [Backup & Remove] ${item}`);
  }
}

console.log('=== STEP 2: Staging Admin Only UI ===');
const adminAppDir = path.join(appDir, 'admin');
if (fs.existsSync(adminAppDir)) {
  fs.rmSync(adminAppDir, { recursive: true, force: true });
}
fs.cpSync(adminUiDir, adminAppDir, { recursive: true });

console.log('=== STEP 3: Writing Root Redirect to /admin/dashboard ===');
fs.writeFileSync(
  path.join(appDir, 'page.tsx'),
  `import { redirect } from 'next/navigation';\n\nexport default function RootPage() {\n  redirect('/admin/dashboard');\n}\n`
);

let buildSucceeded = false;
try {
  console.log('=== STEP 4: Compiling Admin Standalone Next.js Bundle ===');
  execSync('npm run build', { 
    cwd: frontendDir, 
    stdio: 'inherit',
    env: { ...process.env, STANDALONE_BUILD: 'true' }
  });
  buildSucceeded = true;

  console.log('=== STEP 5: Deploying Clean Admin Bundle to admin-desktop ===');
  if (fs.existsSync(adminResourcesFrontendDir)) {
    fs.rmSync(adminResourcesFrontendDir, { recursive: true, force: true });
  }
  fs.mkdirSync(adminResourcesFrontendDir, { recursive: true });

  const standaloneDir = path.join(frontendDir, '.next', 'standalone');
  fs.cpSync(standaloneDir, adminResourcesFrontendDir, { recursive: true });

  const staticDir = path.join(frontendDir, '.next', 'static');
  fs.cpSync(staticDir, path.join(adminResourcesFrontendDir, '.next', 'static'), { recursive: true });

  const publicDir = path.join(frontendDir, 'public');
  fs.cpSync(publicDir, path.join(adminResourcesFrontendDir, 'public'), { recursive: true });

  console.log('  [Success] Clean Admin Standalone deployed to resources/frontend!');
} finally {
  console.log('=== STEP 6: Restoring Customer Site Files ===');
  if (fs.existsSync(adminAppDir)) {
    fs.rmSync(adminAppDir, { recursive: true, force: true });
  }
  const rootPage = path.join(appDir, 'page.tsx');
  if (fs.existsSync(rootPage)) {
    fs.rmSync(rootPage, { force: true });
  }

  for (const item of customerItems) {
    const src = path.join(backupDir, item);
    const dest = path.join(appDir, item);
    if (fs.existsSync(src)) {
      fs.cpSync(src, dest, { recursive: true });
      console.log(`  [Restored] ${item}`);
    }
  }
  fs.rmSync(backupDir, { recursive: true, force: true });
}

if (buildSucceeded) {
  console.log('=== STEP 7: Rebuilding Customer Site for Vercel ===');
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
  console.log('=== ALL COMPLETED SUCCESSFULLY! ===');
} else {
  console.error('Build failed; customer files were safely restored.');
  process.exit(1);
}
