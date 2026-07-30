/**
 * RTX Logo resize script — generates all required icon sizes from RTX LOGO.png
 * Run: node generate-icons.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if sharp is available, if not install it temporarily
try {
  require.resolve('sharp');
} catch {
  console.log('Installing sharp...');
  execSync('npm install sharp --no-save', { stdio: 'inherit', cwd: path.join(__dirname) });
}

const sharp = require('sharp');

const INPUT = path.join(__dirname, 'public', 'RTX LOGO.png');
const PUBLIC = path.join(__dirname, 'public');

async function main() {
  console.log('Generating RTX icon sizes...\n');

  const sizes = [
    // Standard favicon sizes
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    // Apple touch icon
    { name: 'apple-touch-icon.png', size: 180 },
    // Android/PWA manifest icons
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-512x512.png', size: 512 },
    // OpenGraph / social sharing
    { name: 'og-image.png', size: 1200, height: 630 },
  ];

  for (const { name, size, height } of sizes) {
    const out = path.join(PUBLIC, name);
    const h = height || size;
    
    if (height) {
      // For OG image: fit inside with black background (keep logo aspect ratio centered)
      await sharp(INPUT)
        .resize(size, h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
        .toFile(out);
    } else {
      await sharp(INPUT).resize(size, size, { fit: 'cover' }).toFile(out);
    }
    console.log(`✅ ${name} (${size}x${h || size})`);
  }

  // Generate favicon.ico as a multi-size ICO using 16, 32, 48 layers
  // sharp doesn't support .ico natively, so we use png-to-ico via a simple approach
  // We'll use the 32x32 PNG as a fallback .ico base, then rename
  // For proper .ico we need png-to-ico package
  try {
    execSync('npm list png-to-ico 2>&1 || npm install png-to-ico --no-save', { cwd: __dirname, stdio: 'inherit' });
    const pngToIco = require('png-to-ico');
    const icoBuffer = await pngToIco([
      path.join(PUBLIC, 'favicon-16x16.png'),
      path.join(PUBLIC, 'favicon-32x32.png'),
      path.join(PUBLIC, 'favicon-48x48.png'),
    ]);
    fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), icoBuffer);
    console.log('✅ favicon.ico (16+32+48 multi-size)');
  } catch (e) {
    console.log('⚠️  favicon.ico — using sharp fallback (copy 32x32 as .ico)');
    fs.copyFileSync(path.join(PUBLIC, 'favicon-32x32.png'), path.join(PUBLIC, 'favicon.ico'));
  }

  console.log('\n✅ All icons generated in /public/');
  console.log('\nFiles created:');
  sizes.forEach(s => console.log(`  public/${s.name}`));
  console.log('  public/favicon.ico');
}

main().catch(console.error);
