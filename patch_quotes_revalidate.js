const fs = require('fs');
let c = fs.readFileSync('app/actions/quotes.ts', 'utf-8');

c = c.replace(
  /revalidatePath\("\/admin\/cotizaciones"\);/g,
  "revalidatePath(\"/admin/cotizaciones\");\n  revalidatePath(\"/admin/dashboard\");\n  revalidatePath(\"/admin\");"
);

fs.writeFileSync('app/actions/quotes.ts', c, 'utf-8');
console.log('Success');
