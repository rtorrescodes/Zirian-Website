const fs = require('fs');

function fix(path) {
  let c = fs.readFileSync(path, 'utf-8');
  c = c.replace(/session\?\.user\?\.role/g, "(session?.user as any)?.role");
  fs.writeFileSync(path, c, 'utf-8');
}

fix('app/[locale]/store/[id]/page.tsx');
fix('app/[locale]/store/page.tsx');
