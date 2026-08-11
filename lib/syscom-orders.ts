import { getSyscomToken } from "./syscom";

const SAT_STATE_CODES: Record<string, string> = {
  "aguascalientes": "01",
  "baja california": "02",
  "baja california sur": "03",
  "campeche": "04",
  "coahuila": "05",
  "colima": "06",
  "chiapas": "07",
  "chihuahua": "08",
  "ciudad de mexico": "09",
  "cdmx": "09",
  "distrito federal": "09",
  "durango": "10",
  "guanajuato": "11",
  "guerrero": "12",
  "hidalgo": "13",
  "jalisco": "14",
  "mexico": "15",
  "estado de mexico": "15",
  "edomex": "15",
  "michoacan": "16",
  "morelos": "17",
  "nayarit": "18",
  "nuevo leon": "19",
  "oaxaca": "20",
  "puebla": "21",
  "queretaro": "22",
  "quintana roo": "23",
  "san luis potosi": "24",
  "sinaloa": "25",
  "sonora": "26",
  "tabasco": "27",
  "tamaulipas": "28",
  "tlaxcala": "29",
  "veracruz": "30",
  "yucatan": "31",
  "zacatecas": "32"
};

function getSatStateCode(stateName: string | null | undefined): string {
  if (!stateName) return "09"; // Default CDMX si falta
  const normalized = stateName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return SAT_STATE_CODES[normalized] || "09";
}

export interface SyscomDropshipPayload {
  customerName: string;
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
  items: Array<{
    syscomId: string;
    quantity: number;
  }>;
  isTestMode?: boolean;
}

export async function generateSyscomOrder(payload: SyscomDropshipPayload) {
  const token = await getSyscomToken();
  if (!token) throw new Error("No se pudo obtener el token de Syscom");

  // El cliente pidió cargar el pedido para pago en línea y hacerlo manualmente ("ordenar: false")
  
  const syscomPayload = {
    testmode: payload.isTestMode ?? false,
    tipo_entrega: "domicilio",
    direccion: {
      atencion_a: payload.customerName || "Cliente Web Zirian",
      calle: payload.street1 || "Conocido",
      num_ext: "S/N", 
      colonia: payload.street2 || "Centro", // Default
      ciudad: payload.city || "Ciudad",
      estado: getSatStateCode(payload.state),
      pais: "México",
      codigo_postal: payload.postalCode || "00000",
      telefono: payload.phone || "0000000000"
    },
    // Para cotización, a veces fletera es requerido. 1 = FedEx Terrestre en muchos casos, probamos "paquetexpress"
    fletera: "paquetexpress", 
    metodo_pago: "transferencia", // As we'll pay manually
    tipo_pago: "PUE",
    uso_cfdi: "G01",
    ordenar: false, // ¡CRÍTICO! Esto solo crea una cotización para pagar manual
    productos: payload.items.map(item => ({
      id: parseInt(item.syscomId),
      cantidad: item.quantity,
      tipo: "nuevo"
    }))
  };

  try {
    const response = await fetch("https://developers.syscom.mx/api/v1/carrito/generar", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(syscomPayload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Syscom Error Response:", data);
      throw new Error(data.error || "Error al generar carrito en Syscom");
    }

    return data;
  } catch (error) {
    console.error("Syscom Order Generation Error:", error);
    throw error;
  }
}
