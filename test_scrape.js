process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';

async function test(targetUrl) {
  try {
    const url = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(url);
    const data = await res.json();
    
    console.log(targetUrl);
    console.log(JSON.stringify(data.data, null, 2));
    console.log('---');
  } catch (e) {
    console.error(e);
  }
}

test('https://articulo.mercadolibre.com.mx/MLM-1466031737-cargador-ev-level-2-220v-_JM');
test('https://www.syscom.mx/producto/DHI-NVR4104HS-P-4KS2-L-DAHUA-74636.html');
