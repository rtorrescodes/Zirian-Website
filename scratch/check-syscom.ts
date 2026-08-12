import { searchSyscomProducts, getSyscomProduct } from "../lib/syscom";

async function run() {
  const products = await searchSyscomProducts("epcom");
  if (products.length > 0) {
    const prod = await getSyscomProduct(products[0].producto_id);
    console.log(JSON.stringify(prod?.categorias, null, 2));
  } else {
    console.log("No products found");
  }
}

run();

run();
