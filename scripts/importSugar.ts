import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dumpPath = path.join(__dirname, '../qjgjivmy_suit283.sql');
  const sqlDump = fs.readFileSync(dumpPath, 'utf8');

  // Regex para encontrar INSERT INTO `accounts` ... VALUES (...)
  const accountsInsertRegex = /INSERT INTO `accounts` \([^)]+\) VALUES\n([\s\S]*?);/g;
  
  let match;
  let totalImported = 0;

  console.log('--- Iniciando Importación de SugarCRM ---');

  while ((match = accountsInsertRegex.exec(sqlDump)) !== null) {
    const valuesString = match[1];
    
    // Separamos cada registro. Formato: ('id', 'nombre', ...), ('id', ...)
    // Cuidado con las comas dentro de strings. Un split simple no sirve.
    // Usaremos un regex para capturar las tuplas.
    const tupleRegex = /\((.*?)\)/g;
    let tupleMatch;

    while ((tupleMatch = tupleRegex.exec(valuesString)) !== null) {
      const rowStr = tupleMatch[1];
      
      const row = [];
      let current = '';
      let inString = false;
      
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === "'") {
          inString = !inString;
        } else if (char === ',' && !inString) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim()); // push last field

      const id = row[0]?.replace(/^'|'$/g, '');
      const name = row[1]?.replace(/^'|'$/g, '');
      const description = row[6]?.replace(/^'|'$/g, '') || '';
      const street = row[13]?.replace(/^'|'$/g, '') || '';
      const city = row[14]?.replace(/^'|'$/g, '') || '';
      const phone = row[19]?.replace(/^'|'$/g, '') || '';
      const phone_alt = row[20]?.replace(/^'|'$/g, '') || '';

      if (name && name !== 'NULL' && name !== '') {
        const telefonoFinal = phone !== 'NULL' && phone !== '' ? phone : (phone_alt !== 'NULL' && phone_alt !== '' ? phone_alt : '0000000000');
        const ubicacionFinal = `${street}, ${city}`.replace(/^, | , $/g, '').trim() || 'Sin ubicación';

        try {
          await prisma.client.create({
            data: {
              nombre: name,
              telefono: telefonoFinal,
              ubicacion: ubicacionFinal,
              notas: `Importado de SugarCRM.\nDesc: ${description !== 'NULL' ? description : ''}`,
              origen: 'SugarCRM',
              status: 'Lead'
            }
          });
          totalImported++;
          console.log(`Importado Account: ${name}`);
        } catch (e: any) {
          console.error(`Error importando Account ${name}:`, e.message);
        }
      }
    }
  }

  // Ahora Contacts
  const contactsInsertRegex = /INSERT INTO `contacts` \([^)]+\) VALUES\n([\s\S]*?);/g;
  while ((match = contactsInsertRegex.exec(sqlDump)) !== null) {
      const valuesString = match[1];
      const tupleRegex = /\((.*?)\)/g;
      let tupleMatch;
  
      while ((tupleMatch = tupleRegex.exec(valuesString)) !== null) {
        const rowStr = tupleMatch[1];
        const row = [];
        let current = '';
        let inString = false;
        
        for (let i = 0; i < rowStr.length; i++) {
          const char = rowStr[i];
          if (char === "'") {
            inString = !inString;
          } else if (char === ',' && !inString) {
            row.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        row.push(current.trim());
  
        const first_name = row[9]?.replace(/^'|'$/g, '') || '';
        const last_name = row[10]?.replace(/^'|'$/g, '') || '';
        const name = `${first_name} ${last_name}`.trim();
        const phone_mobile = row[16]?.replace(/^'|'$/g, '') || '';
        const street = row[20]?.replace(/^'|'$/g, '') || '';
        const city = row[21]?.replace(/^'|'$/g, '') || '';
        const description = row[5]?.replace(/^'|'$/g, '') || '';
  
        if (name && name !== 'NULL' && name !== '') {
          // Verify if it already exists (same name) to avoid duplicates from accounts
          const existing = await prisma.client.findFirst({ where: { nombre: name } });
          if (!existing) {
            const telefonoFinal = phone_mobile !== 'NULL' && phone_mobile !== '' ? phone_mobile : '0000000000';
            const ubicacionFinal = `${street}, ${city}`.replace(/^, | , $/g, '').trim() || 'Sin ubicación';
            
            try {
              await prisma.client.create({
                data: {
                  nombre: name,
                  telefono: telefonoFinal,
                  ubicacion: ubicacionFinal,
                  notas: `Importado de SugarCRM (Contacto).\nDesc: ${description !== 'NULL' ? description : ''}`,
                  origen: 'SugarCRM',
                  status: 'Lead'
                }
              });
              totalImported++;
              console.log(`Importado Contacto: ${name}`);
            } catch (e: any) {
              console.error(`Error importando contacto ${name}:`, e.message);
            }
          } else {
             console.log(`Omitido (Duplicado de Account): ${name}`);
          }
        }
      }
    }

  console.log(`\n--- Proceso completado. Total importados: ${totalImported} ---`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
