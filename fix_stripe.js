const fs = require('fs');
let c = fs.readFileSync('app/api/webhooks/stripe/route.ts', 'utf-8');

c = c.replace(
  "const session = event.data.object as Stripe.Checkout.Session;",
  "const session = event.data.object as Stripe.Checkout.Session & { shipping_details?: any, customer_details?: any };"
);

fs.writeFileSync('app/api/webhooks/stripe/route.ts', c, 'utf-8');
