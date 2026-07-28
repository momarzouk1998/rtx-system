const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/app');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if(c.includes('toLocaleDateString')) {
    c = c.replace(/\.toLocaleDateString\(['"][a-zA-Z-]+['"](?:,\s*\{[^}]+\})?\)/g, '.toISOString().split("T")[0]');
    fs.writeFileSync(f, c);
    console.log('Fixed ' + f);
  }
});
