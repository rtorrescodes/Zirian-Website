const fs = require('fs');
let c = fs.readFileSync('app/admin/ajustes/page.tsx', 'utf-8');

c = c.replace(
  "        </div>\n            </div>\n    </AppShell>",
  "        </div>\n      </div>\n    </div>\n    </AppShell>"
);

fs.writeFileSync('app/admin/ajustes/page.tsx', c, 'utf-8');
