const fs = require('fs');
let c = fs.readFileSync('lib/pdf/BaseQuotePdf.tsx', 'utf-8');
c = c.replace(/\{\/\* Compromiso Zirian Section \*\/\}[\s\S]*?<\/View>\s*<\/View>/m, 
\{/* Compromiso Zirian Section */}
        {!isGeneral && (
          <View style={{ marginHorizontal: 40, marginBottom: 5 }}>
            <Text style={styles.compromisoTitle}>{isEn ? 'ZIRIAN COMMITMENT' : 'COMPROMISO ZIRIAN'}</Text>
          </View>
        )}
        <View style={styles.compromisoWrapper}>
          <View style={styles.compromisoLeft}>
            {!isGeneral && (
              <>
                <Text style={styles.compromisoTextItalic}>
                  {isEn
                    ? '"We guarantee leading infrastructure compatible with BYD, operating under the strictest safety and regulatory standards in BCS."'
                    : '"Garantizamos infraestructura l\\u00edder y compatible con BYD, operando bajo los m\\u00e1s estrictos est\\u00e1ndares normativos de seguridad en BCS."'
                  }
                </Text>
                <Text style={styles.compromisoAuthor}>{isEn ? 'Zirian M\\u00e9xico Team' : 'Equipo Zirian M\\u00e9xico'}</Text>
              </>
            )}
          </View>
        </View>\);
fs.writeFileSync('lib/pdf/BaseQuotePdf.tsx', c);
