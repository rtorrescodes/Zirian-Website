const fs = require('fs');
const path = require('path');
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const translatePage = async () => {
  const filePath = path.join(__dirname, 'app', '[locale]', 'page-es.tsx');
  const targetPath = path.join(__dirname, 'app', '[locale]', 'page-en.tsx');
  
  const content = fs.readFileSync(filePath, 'utf8');

  console.log('Sending to DeepSeek for translation... (This might take a minute)');
  
  const prompt = `Translate the following React TSX file from Spanish to English. 
  CRITICAL INSTRUCTIONS:
  1. DO NOT change ANY code logic, variable names, classNames, function names, or imports.
  2. ONLY translate the visible text (strings inside JSX, alt tags, placeholders, aria-labels).
  3. Keep the exact same formatting and structure. 
  4. The translation should sound professional, using technical terms for EV chargers, solar, and CCTV.
  5. Return ONLY the raw TSX code, without any markdown backticks.
  
  File content:
  ${content}
  `;

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });

    const data = await res.json();
    if (!data.choices || !data.choices[0]) {
      console.error('Failed to get response', data);
      return;
    }
    let translated = data.choices[0].message.content;
    if (translated.startsWith('```tsx')) {
      translated = translated.replace(/^```tsx\n/, '').replace(/```$/, '');
    } else if (translated.startsWith('```')) {
      translated = translated.replace(/^```\n/, '').replace(/```$/, '');
    }
    
    fs.writeFileSync(targetPath, translated);
    console.log('Translation complete! Saved to page-en.tsx');
  } catch (error) {
    console.error('Error translating:', error);
  }
};

translatePage();
