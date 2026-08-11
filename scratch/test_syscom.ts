import { getSyscomToken, searchSyscomProducts, getSyscomProduct } from './lib/syscom';
import * as dotenv from 'dotenv';
dotenv.config();

async function testSyscom() {
  console.log("Token...");
  const token = await getSyscomToken();
  console.log("Token is:", token ? "SUCCESS" : "FAILED");
  if (!token) return;

  console.log("\nBuscando EcoFlow...");
  const ecoflow = await searchSyscomProducts("ecoflow");
  console.log(`Se encontraron ${ecoflow.length} productos.`);
  
  if (ecoflow.length > 0) {
    const first = ecoflow[0];
    console.log("Primer producto:", JSON.stringify(first, null, 2));
    
    console.log("\nObteniendo detalle...");
    const detail = await getSyscomProduct(first.producto_id);
    console.log("Detalles (parcial):", JSON.stringify(detail, null, 2).substring(0, 1000));
  }
}

testSyscom();
