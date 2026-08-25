const fs = require('fs');
let c = fs.readFileSync('components/panel/app-shell.tsx', 'utf-8');

const docLink = `
              <Link
                href="/admin/configuracion/documentos"
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-tech uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
              >
                <FileText className="h-[18px] w-[18px] text-slate-500" />
                Biblioteca Docs
              </Link>`;

c = c.replace(/Catálogo Syscom\r?\n\s*<\/Link>/, "Catálogo Syscom\n              </Link>" + docLink);

fs.writeFileSync('components/panel/app-shell.tsx', c, 'utf-8');
