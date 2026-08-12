let syscomToken: string | null = null;
let tokenExpiresAt: number = 0;

export interface SyscomProduct {
  producto_id: string;
  modelo: string;
  titulo: string;
  marca: string;
  img_portada: string;
  link_privado: string;
  categorias?: any[];
  total_existencia?: number;
  existencia?: {
    nuevo?: number;
  };
  precios?: {
    precio_1?: string;
    precio_lista?: string;
  };
  caracteristicas?: string[];
  recursos?: any[];
  imagenes?: {
    imagen: string;
    orden: string;
  }[];
}

export async function getSyscomToken(): Promise<string | null> {
  if (syscomToken && Date.now() < tokenExpiresAt) {
    return syscomToken;
  }

  const clientId = process.env.SYSCOM_CLIENT_ID;
  const clientSecret = process.env.SYSCOM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("Faltan credenciales de SYSCOM_CLIENT_ID o SYSCOM_CLIENT_SECRET en el .env");
    return null;
  }

  try {
    const response = await fetch("https://developers.syscom.mx/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo token Syscom: ${response.statusText}`);
    }

    const data = await response.json();
    syscomToken = data.access_token;
    // Set expiration 5 minutes before actual expiry to be safe
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
    
    return syscomToken;
  } catch (error) {
    console.error("Syscom Auth Error:", error);
    return null;
  }
}

export async function searchSyscomProducts(query: string = "cctv"): Promise<SyscomProduct[]> {
  const token = await getSyscomToken();
  if (!token) return [];

  try {
    const response = await fetch(`https://developers.syscom.mx/api/v1/productos?busqueda=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Cache searches for 1 hour to prevent rate limiting, unless forced
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Error buscando productos: ${response.statusText}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.productos)) {
      return data.productos.filter((p: any) => p.existencia && (p.existencia.nuevo > 0 || (p.total_existencia && p.total_existencia > 0)));
    }
    if (Array.isArray(data)) {
      return data.filter((p: any) => p.existencia && (p.existencia.nuevo > 0 || (p.total_existencia && p.total_existencia > 0)));
    }
    return [];
  } catch (error) {
    console.error("Syscom Search Error:", error);
    return [];
  }
}

let cachedExchangeRate: number | null = null;
let exchangeRateExpires: number = 0;

export async function getSyscomExchangeRate(): Promise<number> {
  if (cachedExchangeRate && Date.now() < exchangeRateExpires) {
    return cachedExchangeRate;
  }
  
  const token = await getSyscomToken();
  if (!token) return 20.00; // Fallback to 20 MXN if auth fails

  try {
    const response = await fetch("https://developers.syscom.mx/api/v1/tipocambio", {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.normal) {
        cachedExchangeRate = parseFloat(data.normal);
        exchangeRateExpires = Date.now() + 3600000; // Cache for 1 hour
        return cachedExchangeRate;
      }
    }
  } catch (error) {
    console.error("Exchange Rate Error:", error);
  }
  return 20.00;
}

export async function getSyscomProduct(id: string): Promise<SyscomProduct | null> {
  const token = await getSyscomToken();
  if (!token) return null;

  try {
    const response = await fetch(`https://developers.syscom.mx/api/v1/productos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Syscom Get Product Error:", error);
    return null;
  }
}
