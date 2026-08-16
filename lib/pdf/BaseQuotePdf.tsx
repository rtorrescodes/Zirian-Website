import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Formato de moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

// Define styles para el nuevo diseño Zirian
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 0,
    paddingBottom: 20,
  },
  headerWrapper: {
    paddingTop: 20,
    paddingHorizontal: 40,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    height: 45,
    width: 180,
    objectFit: 'contain',
    marginBottom: 10,
  },
  companyInfo: {
    width: '60%',
  },
  companyTitle: {
    color: '#1C497B',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyText: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  quoteHeaderRight: {
    width: '40%',
    alignItems: 'flex-end',
  },
  quoteTitle: {
    fontSize: 24,
    color: '#1C497B',
    fontWeight: 'black',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  quoteNumber: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'Courier',
  },
  infoBlocksContainer: {
    flexDirection: 'row',
    marginHorizontal: 40,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    marginBottom: 6,
  },
  infoBlock: {
    flex: 1,
  },
  infoBlockRight: {
    flex: 1,
  },
  infoBlockTitle: {
    backgroundColor: '#1C497B',
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    textTransform: 'uppercase',
  },
  infoBlockContent: {
    padding: 8,
  },
  infoBlockContentRight: {
    padding: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#cbd5e1',
  },
  clientName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 8,
    color: '#334155',
    marginBottom: 1,
  },
  emissionDetail: {
    fontSize: 8,
    color: '#334155',
    marginBottom: 2,
  },
  emissionBold: {
    fontWeight: 'bold',
  },
  introSection: {
    paddingHorizontal: 40,
    marginBottom: 8,
  },
  introText: {
    fontSize: 8,
    color: '#334155',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  banner: {
    marginHorizontal: 40,
    backgroundColor: '#25B150',
    paddingVertical: 4,
    marginBottom: 2,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableWrapper: {
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1C497B',
    paddingVertical: 6,
  },
  thQty: { width: '8%', color: '#ffffff', fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  thProduct: { width: '30%', color: '#ffffff', fontSize: 8, fontWeight: 'bold', paddingLeft: 5 },
  thDesc: { width: '22%', color: '#ffffff', fontSize: 8, fontWeight: 'bold', paddingLeft: 5 },
  thPrice: { width: '12%', color: '#ffffff', fontSize: 8, fontWeight: 'bold', textAlign: 'right' },
  thIVA: { width: '12%', color: '#ffffff', fontSize: 8, fontWeight: 'bold', textAlign: 'right' },
  thTotal: { width: '16%', color: '#ffffff', fontSize: 8, fontWeight: 'bold', textAlign: 'right', paddingRight: 5 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 6,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tdQty: { width: '8%', fontSize: 8, textAlign: 'center', fontWeight: 'bold' },
  tdProduct: { width: '30%', fontSize: 8, paddingLeft: 5, paddingRight: 5 },
  productName: { fontWeight: 'bold', color: '#0f172a', marginBottom: 2 },
  productDesc: { color: '#64748b' },
  tdDesc: { width: '22%', fontSize: 8, paddingLeft: 5, paddingRight: 5, color: '#64748b' },
  tdPrice: { width: '12%', fontSize: 8, textAlign: 'right' },
  tdIVA: { width: '12%', fontSize: 8, textAlign: 'right' },
  tdTotal: { width: '16%', fontSize: 8, textAlign: 'right', paddingRight: 5, fontWeight: 'bold' },
  totalsWrapper: {
    flexDirection: 'row',
    marginHorizontal: 40,
    marginBottom: 5,
  },
  totalsLeft: {
    width: '50%',
    padding: 10,
  },
  totalsNoteText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  totalsRight: {
    width: '50%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalsLabel: {
    width: '50%',
    textAlign: 'right',
    fontSize: 9,
    fontWeight: 'bold',
    paddingRight: 10,
  },
  totalsValue: {
    width: '40%',
    textAlign: 'right',
    fontSize: 9,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingTop: 4,
  },
  grandTotalLabel: {
    width: '50%',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'black',
    color: '#1C497B',
    paddingRight: 10,
    textTransform: 'uppercase',
  },
  grandTotalValue: {
    width: '50%',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'black',
    color: '#1C497B',
  },
  termsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 40,
    marginBottom: 0,
  },
  termItem: {
    width: '33%',
    paddingRight: 10,
    marginBottom: 5,
  },
  termsTitle: {
    color: '#334155',
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  termsText: {
    fontSize: 7,
    color: '#64748b',
    lineHeight: 1.2,
  },
  compromisoWrapper: {
    marginHorizontal: 40,
    marginBottom: 0,
  },
  compromisoLeft: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 5,
  },
  compromisoTitle: {
    color: '#1C497B',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  compromisoTextItalic: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#475569',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  compromisoAuthor: {
    color: '#1C497B',
    fontSize: 8,
    fontWeight: 'bold',
  },
  graciasText: {
    color: '#1C497B',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  instalacionesStrip: {
    width: '100%',
    height: 70,
    objectFit: 'cover',
  },
  stripContainer: {
    marginHorizontal: 40,
    marginBottom: 2,
  },
  footerBanner: {
    backgroundColor: '#25B150',
    marginHorizontal: 40,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  footerBannerText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pageFooter: {
    marginTop: 0,
    marginHorizontal: 40,
    backgroundColor: '#25B150',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  pageFooterText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  }
});

export const BaseQuotePdf = ({ quote, client, logoData, stripData }: { quote: any, client: any, logoData?: string, stripData?: string }) => {
  const defaultLogoPath = typeof window !== 'undefined' ? '/logo-zirian-cotizador.png' : require('path').join(process.cwd(), 'public', 'logo-zirian-cotizador.png');
  const defaultStripPath = typeof window !== 'undefined' ? '/instalaciones-strip.png' : require('path').join(process.cwd(), 'public', 'instalaciones-strip.png');
  
  const logoPath = logoData || defaultLogoPath;
  const stripPath = stripData || defaultStripPath;

  const createdAt = new Date(quote.fecha_creacion);
  const validUntil = new Date(createdAt.getTime() + (quote.validez_dias || 15) * 86400000);

  let displayItems: any[] = [];
  
  if (quote.mostrar_desglose) {
    displayItems = quote.items.map((i: any) => {
      let unit = (i.product?.unidad_medida || 'PZA').substring(0, 3).toUpperCase();
      if ((i.product?.nombre || '').toLowerCase().includes('cable')) unit = 'MTS';
      
      return {
        qty: `${Number(i.cantidad)} ${unit}`,
        name: i.product?.nombre || i.descripcion || 'Producto/Servicio',
        desc: i.descripcion || '',
        price: Number(i.precio_unitario),
        total: Number(i.total),
        iva: (quote.requiere_factura || quote.impuestos > 0) ? Number(i.total) * 0.16 : 0,
        isGroup: false
      };
    });
  } else {
    const groups: Record<string, any> = {};
    const groupPrices = quote.group_prices || {};
    
    // Find cable meters for Instalación de Cargador EV
    let cableMetros = 0;
    quote.items.forEach((i: any) => {
      const name = (i.product?.nombre || i.descripcion || '').toLowerCase();
      if (name.includes('cable')) {
        cableMetros = Math.max(cableMetros, Number(i.cantidad));
      }
    });
    
    quote.items.forEach((i: any) => {
      const groupName = i.product?.grupo_impresion || 'Concepto General';
      
      if (!groups[groupName]) {
        groups[groupName] = {
          qty: "1 LOTE",
          name: groupName,
          desc: '',
          price: groupPrices[groupName] !== undefined ? groupPrices[groupName] : 0,
          total: 0,
          iva: 0,
          isGroup: true
        };
      }
      
      if (groupName === 'Instalación de Cargador EV') {
        groups[groupName].desc = `(Incluye materiales, instalación a ${cableMetros} metros)`;
      } else {
        const pDesc = i.product?.descripcion || '';
        if (i.descripcion && !groups[groupName].desc.includes(i.descripcion)) {
          groups[groupName].desc += (groups[groupName].desc ? ' • ' : '') + i.descripcion;
        } else if (pDesc && !groups[groupName].desc.includes(pDesc)) {
          groups[groupName].desc += (groups[groupName].desc ? ' • ' : '') + pDesc;
        }
      }
      
      // If there is NO custom price, we sum the actual items. Otherwise, we ignore individual item totals!
      if (groupPrices[groupName] === undefined) {
        const itemTotal = Number(i.total);
        groups[groupName].price += itemTotal;
      }
    });
    
    // Now calculate Total & IVA per group based on their final overridden prices
    Object.values(groups).forEach(g => {
      g.total = g.price;
      g.iva = (quote.requiere_factura || quote.impuestos > 0) ? g.total * 0.16 : 0;
    });
    
    displayItems = Object.values(groups);
  }

  const calculatedSubtotal = displayItems.reduce((acc: number, item: any) => acc + item.total, 0);
  const calculatedIva = (quote.requiere_factura || quote.impuestos > 0) ? calculatedSubtotal * 0.16 : 0;
  const calculatedTotal = calculatedSubtotal + calculatedIva;

  const isEn = quote.template === 'ev_charger_en';
  const isGeneral = quote.template === 'general';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.companyInfo}>
            <Image src={logoPath} style={styles.logo} />
            <Text style={styles.companyTitle}>Energía y sistemas, donde necesites</Text>
            <Text style={styles.companyText}>San José del Cabo, Baja California Sur</Text>
            <Text style={styles.companyText}>WhatsApp: (624) 6220525 | www.zirian.com</Text>
          </View>
          <View style={styles.quoteHeaderRight}>
            <Text style={styles.quoteTitle}>Cotización</Text>
            <Text style={styles.quoteNumber}># COT-{createdAt.getFullYear()}-{quote.id.toString().padStart(4, '0')}</Text>
          </View>
        </View>

        {/* Info Blocks */}
        <View style={styles.infoBlocksContainer}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoBlockTitle}>Cliente</Text>
            <View style={styles.infoBlockContent}>
              <Text style={styles.clientName}>{client.nombre}</Text>
              {client.empresa ? <Text style={styles.clientDetail}>{client.empresa}</Text> : null}
              <Text style={styles.clientDetail}>{client.ubicacion || 'Sin dirección registrada'}</Text>
            </View>
          </View>
          <View style={styles.infoBlockRight}>
            <Text style={styles.infoBlockTitle}>{isEn ? 'Emission Details' : 'Detalles de Emisión'}</Text>
            <View style={styles.infoBlockContentRight}>
              <Text style={styles.emissionDetail}><Text style={styles.emissionBold}>{isEn ? 'Date: ' : 'Fecha: '}</Text>{createdAt.toLocaleDateString(isEn ? 'en-US' : 'es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
              <Text style={styles.emissionDetail}><Text style={styles.emissionBold}>{isEn ? 'Valid until: ' : 'Validez: '}</Text>{validUntil.toLocaleDateString(isEn ? 'en-US' : 'es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
              <Text style={styles.emissionDetail}><Text style={styles.emissionBold}>{isEn ? 'Agent: ' : 'Agente: '}</Text>Ing. Rodrigo Torres</Text>
            </View>
          </View>
        </View>

        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>{isEn ? 'Dear Client:' : 'Estimado/a cliente:'}</Text>
          <Text style={styles.introText}>
            {isEn 
              ? 'It is a pleasure to present our technical proposal for the integration of your ecosystem. At Zirian México, we prioritize regulatory safety and energy efficiency.'
              : 'Es un gusto presentarle nuestra propuesta técnica para la integración de su ecosistema. En Zirian México, priorizamos la seguridad normativa y la eficiencia energética.'}
          </Text>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {isGeneral 
              ? 'Alta Ingeniería Eléctrica / Automatización / Videovigilancia / Redes / Sistemas' 
              : isEn 
                ? 'EV Chargers / Solar Panels / Automatic Sprinklers / Air Conditioners / Electric Gates / Internet Networks / Systems'
                : 'Cargadores EV / Paneles Solares / Riego automático / Aires Acondicionados / Portones Eléctricos / Redes Internet / Sistemas'
            }
          </Text>
        </View>

        {/* Table */}
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={styles.thQty}>{isEn ? 'Qty' : 'Cant'}</Text>
            <Text style={styles.thProduct}>{isEn ? 'Product' : 'Producto'}</Text>
            <Text style={styles.thDesc}>{isEn ? 'Description' : 'Descripción'}</Text>
            <Text style={styles.thPrice}>{isEn ? 'Price' : 'Precio'}</Text>
            <Text style={styles.thIVA}>{isEn ? 'Tax' : 'IVA'}</Text>
            <Text style={styles.thTotal}>Total</Text>
          </View>
          
          {displayItems.length === 0 ? (
            <View style={[styles.tableRow, { justifyContent: 'center' }]}>
              <Text style={{ fontSize: 9, color: '#94a3b8', fontStyle: 'italic' }}>No hay conceptos en la cotización</Text>
            </View>
          ) : (
            displayItems.map((item: any, idx: number) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 0 ? styles.tableRowAlt : {}]}>
                <Text style={styles.tdQty}>{item.qty}</Text>
                <View style={styles.tdProduct}>
                  <Text style={styles.productName}>{item.name}</Text>
                </View>
                <View style={styles.tdDesc}>
                  <Text style={styles.productDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.tdPrice}>{formatCurrency(item.price)}</Text>
                <Text style={styles.tdIVA}>{(quote.requiere_factura || quote.impuestos > 0) ? '16%' : '0%'}</Text>
                <Text style={styles.tdTotal}>{formatCurrency(item.total + item.iva)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalsLeft}>
            <Text style={styles.totalsNoteText}>{isEn ? 'Technical Note:' : 'Nota Técnica:'}</Text>
            {quote.notas_cliente ? <Text style={{ fontSize: 8, color: '#475569', marginTop: 3 }}>{quote.notas_cliente}</Text> : null}
          </View>
          <View style={styles.totalsRight}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(calculatedSubtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>{isEn ? 'Tax (16%)' : 'I.V.A. (16%)'}</Text>
              <Text style={styles.totalsValue}>{formatCurrency(calculatedIva)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(calculatedTotal)} {quote.moneda || 'MXN'}</Text>
            </View>
          </View>
        </View>

        {/* Spacer to push everything below to the bottom of the page */}
        <View style={{ flexGrow: 1, minHeight: 20 }} />

        {/* Compromiso Zirian Section */}
        <View style={{ marginHorizontal: 40, marginBottom: 5 }}>
          <Text style={styles.compromisoTitle}>{isEn ? 'ZIRIAN COMMITMENT' : 'COMPROMISO ZIRIAN'}</Text>
        </View>
        <View style={styles.compromisoWrapper}>
          <View style={styles.compromisoLeft}>
            <Text style={styles.compromisoTextItalic}>
              {isGeneral
                ? '"Diseñamos e integramos soluciones tecnológicas de alta ingeniería, garantizando eficiencia, seguridad y calidad superior en BCS."'
                : isEn
                  ? '"We guarantee leading infrastructure compatible with BYD, operating under the strictest safety and regulatory standards in BCS."'
                  : '"Garantizamos infraestructura líder y compatible con BYD, operando bajo los más estrictos estándares normativos de seguridad en BCS."'
              }
            </Text>
            <Text style={styles.compromisoAuthor}>{isEn ? 'Zirian México Team' : 'Equipo Zirian México'}</Text>
          </View>
        </View>

        {/* Image Strip Section Full Width */}
        <View style={styles.stripContainer}>
          <Text style={styles.graciasText}>{isEn ? 'Thank you for your trust' : 'Gracias por su confianza'}</Text>
          <Image src={stripPath} style={styles.instalacionesStrip} />
        </View>

        {/* Footer Banner */}
        {!isGeneral ? (
          <View style={styles.footerBanner}>
            <Text style={styles.footerBannerText}>
              {isEn 
                ? 'MAINTAIN YOUR BYD WARRANTY: We hold the EC1641 EV Charger Installation certification backed by CFE and\nstrictly comply with the NOM-001-SEDE-2012 Electrical Installations standard.'
                : 'MANTENGA SU GARANTÍA BYD: Contamos con certificación EC1641 Instalación de Cargadores EV avalada por la CFE y\ncumplimiento estricto de la NOM-001-SEDE-2012 de Instalaciones Eléctricas.'}
            </Text>
          </View>
        ) : null}

        {/* 6 Terms Blocks */}
        <View style={styles.termsWrapper}>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>{isEn ? '1. SCOPE OF OFFER' : '1. ALCANCE DE LA OFERTA'}</Text>
            <Text style={styles.termsText}>{isEn ? 'This proposal includes exclusively the described items. Any additional requirement, material, or work not included will be quoted separately.' : 'Esta propuesta incluye exclusivamente los conceptos descritos. Cualquier requerimiento, material o trabajo adicional no contemplado será cotizado por separado.'}</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>{isEn ? '3. CLIENT RESPONSIBILITY' : '3. RESPONSABILIDAD DEL CLIENTE'}</Text>
            <Text style={styles.termsText}>{isEn ? 'The client must guarantee free access to the site and is responsible for processing any necessary permits (CFE/municipality) unless otherwise agreed.' : 'El cliente deberá garantizar el libre acceso al sitio y será responsable de tramitar los permisos necesarios (CFE/municipio) salvo acuerdo previo.'}</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>{isEn ? '5. VALIDITY & PAYMENT TERMS' : '5. VALIDEZ Y CONDICIONES DE PAGO'}</Text>
            <Text style={styles.termsText}>{isEn ? 'Quote valid for 30 days. Requires an advance payment to start and balance against delivery. Payment delays will pause installation times.' : 'Cotización válida por 30 días. Requiere anticipo para inicio y saldo contra entrega. Retrasos en los pagos pausarán los tiempos de instalación.'}</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>{isEn ? '2. WARRANTY & COVERAGE' : '2. GARANTÍA Y COBERTURA'}</Text>
            <Text style={styles.termsText}>{isEn ? 'Warranty applies to equipment installed by Zirian. Excludes damage caused by misuse, voltage fluctuations, third parties, or natural phenomena.' : 'Garantía sobre equipos instalados por Zirian. Quedan excluidos daños por uso indebido, variaciones de voltaje, terceros o fenómenos naturales.'}</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>{isEn ? '4. TECHNICAL SUPPORT' : '4. SOPORTE TÉCNICO'}</Text>
            <Text style={styles.termsText}>{isEn ? 'Remote assistance for troubleshooting. On-site visits are subject to availability (travel expenses apply outside BCS).' : 'Asistencia remota para diagnóstico de fallas. Las visitas presenciales están sujetas a disponibilidad (viáticos aplicables fuera de BCS).'}</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>{isEn ? '6. INTELLECTUAL PROPERTY' : '6. PROPIEDAD INTELECTUAL'}</Text>
            <Text style={styles.termsText}>{isEn ? 'Engineering and designs provided are the intellectual property of Zirian. Reproduction or distribution without authorization is prohibited.' : 'La ingeniería y diseños proporcionados son propiedad intelectual de Zirian. Queda prohibida su reproducción o distribución sin autorización.'}</Text>
          </View>
        </View>

        {/* Page Footer (Not absolute, just flows after content) */}
        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>{isEn ? 'Page 1' : 'Página 1'}</Text>
          <Text style={styles.pageFooterText}>{createdAt.toLocaleDateString(isEn ? 'en-US' : 'es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
        </View>

      </Page>
    </Document>
  );
};
