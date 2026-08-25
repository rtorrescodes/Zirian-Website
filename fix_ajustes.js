const fs = require('fs');
let c = fs.readFileSync('app/admin/ajustes/page.tsx', 'utf-8');

c = c.replace("redirect('/admin/login');", "redirect('/admin');");
c = c.replace("import { revalidatePath } from 'next/cache';", "import { revalidatePath } from 'next/cache';\nimport { AppShell } from '@/components/panel/app-shell';");

c = c.replace(/return \(\s*<div className="p-8 max-w-4xl mx-auto">/, "return (\n    <AppShell>\n      <div className=\"p-8 max-w-4xl mx-auto\">");
c = c.replace(/<\/div>\s*<\/div>\s*\);\s*\}/, "      </div>\n    </AppShell>\n  );\n}");

fs.writeFileSync('app/admin/ajustes/page.tsx', c, 'utf-8');
