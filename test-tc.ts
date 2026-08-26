import { getSyscomExchangeRate } from './lib/syscom';

async function run() {
  const tc = await getSyscomExchangeRate();
  console.log("TC:", tc);
}

run();
