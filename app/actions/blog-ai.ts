'use server'

interface BlogIdea {
  title: string;
  summary: string;
}

export async function generateBlogIdeas(topic: string): Promise<BlogIdea[]> {
  const prompt = `Eres un experto redactor de contenido SEO para un blog de tecnología enfocada en paneles solares, cargadores de vehículos eléctricos (EV), cámaras de seguridad CCTV y redes WiFi empresariales.
  El usuario quiere escribir sobre: "${topic}".
  Genera exactamente 3 opciones de artículos. Devuelve la respuesta ESTRICTAMENTE en formato JSON plano (un array de objetos, sin markdown de backticks ni otras palabras), con esta estructura:
  [
      { "title": "Título llamativo y SEO", "summary": "Breve resumen de 2 líneas de lo que tratará el artículo" }
  ]`;

  const dsResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
    })
  });

  if (!dsResponse.ok) {
    throw new Error('Failed to fetch ideas from DeepSeek');
  }

  const dsData = await dsResponse.json();
  let content = dsData.choices[0].message.content.trim();
  
  if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
  } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/```\n?$/, '');
  }

  return JSON.parse(content);
}

export async function generateFullArticle(title: string) {
  const prompt = `Eres un experto redactor de contenido SEO para un blog de Zirian, una empresa de integraciones tecnológicas (CCTV, WiFi, Paneles Solares, Cargadores EV).
  El usuario quiere un artículo completo con el título original: "${title}".
  Debes generar el artículo bilingüe (Español e Inglés al mismo tiempo).
  Devuelve la respuesta ESTRICTAMENTE en formato JSON plano (sin markdown).
  
  Estructura EXACTA del JSON:
  {
      "title": "Título optimizado en Español",
      "title_en": "Título optimizado en Inglés",
      "meta": "Meta descripción SEO en Español (max 150 chars)",
      "meta_en": "Meta descripción SEO en Inglés (max 150 chars)",
      "category": "tecnología",
      "blocks": {
          "intro": "Párrafo introductorio fuerte, destacando el problema y la solución tecnológica (Español)",
          "quote": "Una frase destacada o cita profesional (Español)",
          "section1": "Cuerpo del artículo párrafo 1 (Español)",
          "section2": "Cuerpo del artículo párrafo 2 (Español)",
          "main": "Cuerpo extendido en HTML (usa <h2>, <ul>, <p>, <strong>) (Español)"
      },
      "blocks_en": {
          "intro": "Párrafo introductorio fuerte (Inglés)",
          "quote": "Una frase destacada o cita profesional (Inglés)",
          "section1": "Cuerpo del artículo párrafo 1 (Inglés)",
          "section2": "Cuerpo del artículo párrafo 2 (Inglés)",
          "main": "Cuerpo extendido en HTML (usa <h2>, <ul>, <p>, <strong>) (Inglés)"
      }
  }`;

  const dsResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
    })
  });

  if (!dsResponse.ok) {
    throw new Error('Failed to fetch article from DeepSeek');
  }

  const dsData = await dsResponse.json();
  let content = dsData.choices[0].message.content.trim();
  
  if (content.startsWith('```json')) {
      content = content.replace(/^```json\n?/, '').replace(/```\n?$/, '');
  } else if (content.startsWith('```')) {
      content = content.replace(/^```\n?/, '').replace(/```\n?$/, '');
  }

  const articleData = JSON.parse(content);
  
  // Set image_url to empty, the user will provide the image manually later
  articleData.image_url = "";

  return articleData;
}

export async function editArticleContent(prompt: string, currentContent: string) {
  const sysPrompt = `Eres un experto redactor técnico y editor web. El usuario tiene el siguiente contenido en HTML:
  
${currentContent}

Instrucción del usuario para modificar el contenido: "${prompt}"

Devuelve el NUEVO contenido HTML modificado que cumpla con la instrucción. Mantén las etiquetas HTML correctas (usadas típicamente en editores enriquecidos como <p>, <h2>, <strong>, <em>, <ul>).
Responde EXCLUSIVAMENTE con el código HTML modificado, sin markdown de bloques de código y sin texto explicativo.`;

  const dsResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: sysPrompt }],
        temperature: 0.7
    })
  });

  if (!dsResponse.ok) {
    throw new Error('Failed to edit article via DeepSeek');
  }

  const dsData = await dsResponse.json();
  let newContent = dsData.choices[0].message.content.trim();
  
  if (newContent.startsWith('```html')) {
      newContent = newContent.replace(/^```html\n?/, '').replace(/```\n?$/, '');
  } else if (newContent.startsWith('```')) {
      newContent = newContent.replace(/^```\n?/, '').replace(/```\n?$/, '');
  }

  return newContent;
}
