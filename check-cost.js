const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const res = await fetch('https://developers.syscom.mx/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: 'lsT0mk8DY2iEY1RvEI4kW2xrCLOdyz5X', client_secret: 'n2TaAcT8C44fweZ9TAVgbSHR5yZqAhAw0EhXDplb', grant_type: 'client_credentials' }) });
  const data = await res.json();
  const token = data.access_token;
  
  const tcRes = await fetch('https://developers.syscom.mx/api/v1/tipocambio', { headers: { Authorization: 'Bearer ' + token } });
  const tcData = await tcRes.json();
  const tc = parseFloat(tcData.normal) || 20.0;
  
  const pRes = await fetch('https://developers.syscom.mx/api/v1/productos/226792', { headers: { Authorization: 'Bearer ' + token } });
  const p = await pRes.json();
  
  let cost_usd = parseFloat(p.precios.precio_1); // assuming precio_1 is cost? Or is it special price?
  // wait, Syscom's 'precio_1' is the user's cost usually, or the special price.
  let cost_mxn = cost_usd * tc;
  console.log("Costo estimado MXN:", cost_mxn);
}
main();
