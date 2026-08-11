import { config } from 'dotenv';
config();
import { getSyscomProduct } from '../lib/syscom';

async function test() {
  const prod = await getSyscomProduct('164101'); // EcoFlow Delta
  if (prod) {
    console.log("Imagenes:", prod.imagenes ?? prod.imagenes_arreglo);
    console.log("Recursos:", prod.recursos);
  } else {
    console.log("No product");
  }
}
test();
