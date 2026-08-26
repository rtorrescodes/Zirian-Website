import { searchSyscomProducts } from './lib/syscom';

async function run() {
  const products = await searchSyscomProducts('CCI-R32-12K-220');
  console.log(JSON.stringify(products[0], null, 2));
}

run();
