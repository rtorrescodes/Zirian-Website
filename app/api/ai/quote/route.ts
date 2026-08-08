import { NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

export async function POST(req: Request) {
  try {
    const { prompt, currentItems, availableProducts } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Falta el prompt' }, { status: 400 })
    }

    const systemMessage = `
Eres un asistente experto en cotizaciones eléctricas y sistemas.
Tu tarea es modificar la lista de ítems de una cotización basándote en la petición del usuario.

Dispones de la siguiente lista de productos en el catálogo:
${JSON.stringify(availableProducts.map((p: any) => ({ id: p.id, nombre: p.nombre, codigo: p.codigo })), null, 2)}

La cotización actual tiene estos ítems:
${JSON.stringify(currentItems.map((i: any) => ({ productId: i.product.id, nombre: i.product.nombre, qty: i.qty, detalles: i.detalles })), null, 2)}

Instrucción del usuario: "${prompt}"

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido que contenga la propiedad "newItems", el cual debe ser un arreglo con los ítems actualizados. 
Cada ítem debe tener este formato:
{ "productId": number, "qty": number, "detalles": string }

Si el usuario pide quitar algo, simplemente no lo incluyas en el arreglo.
Si pide cambiar algo (ej. cable 8 por 10), busca el ID correcto en el catálogo y reemplázalo.
Asegúrate de NO usar markdown alrededor del JSON (ni \`\`\`json). SOLO devuelve el objeto JSON crudo.
`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: {
            type: "json_object"
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error de DeepSeek:', errorText)
      return NextResponse.json({ error: 'Error al procesar la solicitud con AI' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'
    
    try {
      const parsed = JSON.parse(content)
      return NextResponse.json(parsed)
    } catch (e) {
      console.error("No se pudo parsear el JSON de DeepSeek:", content)
      return NextResponse.json({ error: 'Respuesta inválida de la IA' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error en AI route:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
