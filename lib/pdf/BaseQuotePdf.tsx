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
    height: 40,
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
    marginBottom: 10,
  },
  infoBlock: {
    flex: 1,
  },
  infoBlockRight: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#cbd5e1',
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
    padding: 10,
  },
  clientName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  clientDetail: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 2,
  },
  emissionDetail: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 3,
  },
  emissionBold: {
    fontWeight: 'bold',
  },
  introSection: {
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  introText: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  banner: {
    marginHorizontal: 40,
    backgroundColor: '#25B150',
    paddingVertical: 4,
    marginBottom: 10,
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 8,
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
    marginBottom: 5,
  },
  termItem: {
    width: '33%',
    paddingRight: 10,
    marginBottom: 10,
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
    marginBottom: 5,
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
    marginBottom: 5,
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
    position: 'absolute',
    bottom: 10,
    left: 40,
    right: 40,
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

export const BaseQuotePdf = ({ quote, client }: { quote: any, client: any }) => {
  const logoPath = typeof window !== 'undefined' ? '/logo-zirian-cotizador.jpg' : require('path').join(process.cwd(), 'public', 'logo-zirian-cotizador.jpg');
  const stripPath = typeof window !== 'undefined' ? '/instalaciones-strip.jpg' : require('path').join(process.cwd(), 'public', 'instalaciones-strip.jpg');

  const createdAt = new Date(quote.fecha_creacion);
  const validUntil = new Date(createdAt.getTime() + (quote.validez_dias || 15) * 86400000);

  // LOGIC: Grouping
  let displayItems = [];
  
  if (quote.mostrar_desglose) {
    // Show all items as they are
    displayItems = quote.items.map((i: any) => ({
      qty: Number(i.cantidad),
      name: i.product.nombre,
      desc: i.descripcion || '',
      price: Number(i.precio_unitario),
      total: Number(i.total),
      iva: Number(i.total) * 0.16
    }));
  } else {
    // Group by grupo_impresion
    const groups: Record<string, any> = {};
    const isGeneral = quote.template === 'general';
    
    quote.items.forEach((i: any) => {
      const groupName = i.product.grupo_impresion || (isGeneral ? 'Equipos y Materiales' : 'Instalación de Cargador EV');
      if (!groups[groupName]) {
        groups[groupName] = {
          qty: 1,
          name: groupName,
          desc: '',
          price: 0,
          total: 0,
          iva: 0
        };
      }
      
      if (i.descripcion && !groups[groupName].desc.includes(i.descripcion)) {
        groups[groupName].desc += (groups[groupName].desc ? '\n' : '') + i.descripcion;
      }
      
      const itemTotal = Number(i.total);
      groups[groupName].price += itemTotal;
      groups[groupName].total += itemTotal;
      groups[groupName].iva += itemTotal * 0.16;
    });

    displayItems = Object.values(groups);
  }

  const calculatedSubtotal = displayItems.reduce((acc: number, item: any) => acc + item.total, 0);
  const calculatedIva = calculatedSubtotal * 0.16;
  const calculatedTotal = calculatedSubtotal + calculatedIva;

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
              {client.empresa && <Text style={styles.clientDetail}>{client.empresa}</Text>}
              <Text style={styles.clientDetail}>{client.ubicacion || 'Sin dirección registrada'}</Text>
              {client.telefono && <Text style={styles.clientDetail}>{client.telefono}</Text>}
            </View>
          </View>
          <View style={styles.infoBlockRight}>
            <Text style={styles.infoBlockTitle}>Detalles de Emisión</Text>
            <View style={styles.infoBlockContent}>
              <Text style={styles.emissionDetail}><Text style={styles.emissionBold}>Fecha: </Text>{createdAt.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
              <Text style={styles.emissionDetail}><Text style={styles.emissionBold}>Validez: </Text>{validUntil.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
              <Text style={styles.emissionDetail}><Text style={styles.emissionBold}>Agente: </Text>Zirian Team</Text>
            </View>
          </View>
        </View>

        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>Estimado/a cliente:</Text>
          <Text style={styles.introText}>Es un gusto presentarle nuestra propuesta técnica para la integración de su ecosistema. En Zirian México, priorizamos la seguridad normativa y la eficiencia energética.</Text>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {quote.template === 'general' 
              ? 'Alta Ingeniería Eléctrica / Automatización / Videovigilancia / Redes / Sistemas' 
              : 'Cargadores EV / Paneles Solares / Riego automatizado / Aires Acondicionados / Portones Eléctricos / Redes Internet / Sistemas'
            }
          </Text>
        </View>

        {/* Table */}
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <Text style={styles.thQty}>Cant</Text>
            <Text style={styles.thProduct}>Producto</Text>
            <Text style={styles.thDesc}>Descripción</Text>
            <Text style={styles.thPrice}>Precio</Text>
            <Text style={styles.thIVA}>IVA</Text>
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
                <Text style={styles.tdIVA}>16%</Text>
                <Text style={styles.tdTotal}>{formatCurrency(item.total + item.iva)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalsLeft}>
            <Text style={styles.totalsNoteText}>Nota Técnica:</Text>
            {quote.notas_cliente && <Text style={{ fontSize: 8, color: '#475569', marginTop: 3 }}>{quote.notas_cliente}</Text>}
          </View>
          <View style={styles.totalsRight}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(calculatedSubtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>I.V.A. (16%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(calculatedIva)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(calculatedTotal)} MXN</Text>
            </View>
          </View>
        </View>

        {/* Compromiso Zirian Section */}
        <View style={{ marginHorizontal: 40, marginBottom: 5 }}>
          <Text style={styles.compromisoTitle}>COMPROMISO ZIRIAN</Text>
        </View>
        <View style={styles.compromisoWrapper}>
          <View style={styles.compromisoLeft}>
            <Text style={styles.compromisoTextItalic}>
              {quote.template === 'general'
                ? '"En Zirian México nos especializamos en soluciones tecnológicas adaptadas a su entorno, garantizando siempre los más altos estándares de calidad, seguridad y eficiencia."'
                : '"En Zirian México nos especializamos en soluciones adaptadas al entorno de BCS, priorizando la compatibilidad técnica con marcas líderes como BYD."'
              }
            </Text>
            <Text style={styles.compromisoAuthor}>System Administrator - Equipo Zirian México</Text>
          </View>
        </View>

        {/* Image Strip Section Full Width */}
        <View style={styles.stripContainer}>
          <Text style={styles.graciasText}>Gracias por su confianza</Text>
          <Image src={stripPath} style={styles.instalacionesStrip} />
        </View>

        {/* Footer Banner */}
        {quote.template !== 'general' && (
          <View style={styles.footerBanner}>
            <Text style={styles.footerBannerText}>MANTENGA SU GARANTÍA BYD: Contamos con certificación EC1641 Instalación de Cargadores EV avalada por la CFE y cumplimiento estricto de la NOM-001-SEDE-2012 de Instalaciones Eléctricas.</Text>
          </View>
        )}

        {/* 6 Terms Blocks */}
        <View style={styles.termsWrapper}>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>1. ALCANCE DE LA OFERTA</Text>
            <Text style={styles.termsText}>La cotización cubre únicamente los conceptos descritos. Cualquier trabajo adicional será cotizado por separado.</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>3. RESPONSABILIDAD DEL CLIENTE</Text>
            <Text style={styles.termsText}>El cliente proveerá acceso seguro y es responsable de permisos (CFE/municipio) salvo pacto en contrario.</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>5. VALIDEZ Y PAGOS</Text>
            <Text style={styles.termsText}>Vigencia de 30 días. Requiere anticipo para inicio y saldo contra entrega. Retrasos suspenden la instalación.</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>2. CONDICIONES DE GARANTÍA</Text>
            <Text style={styles.termsText}>Aplica sobre equipos instalados por Zirian. No cubre mal uso, variaciones de voltaje o fenómenos naturales.</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>4. SOPORTE Y ATENCIÓN</Text>
            <Text style={styles.termsText}>Atención remota para diagnósticos; visitas presenciales según disponibilidad fuera de BCS.</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termsTitle}>6. PROPIEDAD INTELECTUAL</Text>
            <Text style={styles.termsText}>Diseños y diagramas son propiedad de Zirian; prohibida su réplica sin autorización.</Text>
          </View>
        </View>

        {/* Absolute Page Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.pageFooterText}>Página 1</Text>
          <Text style={styles.pageFooterText}>{createdAt.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</Text>
        </View>

      </Page>
    </Document>
  );
};
