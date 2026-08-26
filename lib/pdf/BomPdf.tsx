import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Registrar fuente de Google Fonts (Inter)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff' }, // Regular
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZJhjp-Ek-_EeA.woff', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  logoContainer: {
    width: '40%',
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  headerRight: {
    width: '50%',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    marginBottom: 20,
    gap: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  infoTitle: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 40,
    marginTop: 10,
    marginBottom: 10,
  },
  table: {
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    marginBottom: 6,
  },
  thCheck: { width: '10%', fontSize: 9, fontWeight: 'bold', color: '#64748b', textAlign: 'center' },
  thQty: { width: '15%', fontSize: 9, fontWeight: 'bold', color: '#64748b' },
  thProduct: { width: '75%', fontSize: 9, fontWeight: 'bold', color: '#64748b' },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tdCheck: { 
    width: '10%', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 2,
  },
  tdQty: { width: '15%', fontSize: 10, color: '#334155', fontWeight: 'bold' },
  tdProduct: { width: '75%' },
  productName: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },
  productDesc: { fontSize: 8, color: '#64748b', marginTop: 2 },
  emptyState: {
    fontSize: 9,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  }
});

interface BomPdfProps {
  quote: any;
  logoData?: string | null;
}

export const BomPdf: React.FC<BomPdfProps> = ({ quote, logoData }) => {
  const defaultLogoPath = typeof window !== 'undefined' ? '/logo-zirian-cotizador.png' : require('path').join(process.cwd(), 'public', 'logo-zirian-cotizador.png');
  const logoPath = logoData || defaultLogoPath;

  const createdAt = new Date(quote.fecha_creacion);
  const clientName = quote.client?.nombre || 'Cliente sin nombre';

  // Separar en Stock y Comprar (igual que en QuoteManager)
  const stockItems = quote.items.filter((item: any) => item.product?.stock_general > 0);
  const buyItems = quote.items.filter((item: any) => !item.product?.stock_general || item.product?.stock_general <= 0);

  const renderItem = (item: any, idx: number) => {
    let unit = (item.product?.unidad_medida || 'PZA').substring(0, 3).toUpperCase();
    if ((item.product?.nombre || '').toLowerCase().includes('cable')) unit = 'MTS';

    return (
      <View key={idx} style={styles.tableRow} wrap={false}>
        <View style={styles.tdCheck}>
          <View style={styles.checkbox}></View>
        </View>
        <Text style={styles.tdQty}>{Number(item.cantidad)} {unit}</Text>
        <View style={styles.tdProduct}>
          <Text style={styles.productName}>{item.product?.nombre || item.descripcion}</Text>
          <Text style={styles.productDesc}>{item.product?.codigo || 'Sin código'}</Text>
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoPath} style={styles.logo} />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>Lista de Surtido</Text>
            <Text style={styles.subtitle}>BOM - Bill of Materials</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Proyecto / Cliente</Text>
            <Text style={styles.infoText}>{clientName}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Folio Cotización</Text>
            <Text style={styles.infoText}>COT-{createdAt.getFullYear()}-{quote.id.toString().padStart(4, '0')}</Text>
          </View>
        </View>

        {/* Sección: Almacén */}
        <Text style={styles.sectionTitle}>MATERIAL EN ALMACÉN (CAJUELA)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thCheck}>LISTO</Text>
            <Text style={styles.thQty}>CANT.</Text>
            <Text style={styles.thProduct}>PRODUCTO</Text>
          </View>
          {stockItems.length === 0 ? (
            <Text style={styles.emptyState}>No hay materiales a surtir de almacén</Text>
          ) : (
            stockItems.map((item: any, idx: number) => renderItem(item, idx))
          )}
        </View>

        {/* Sección: Compras */}
        <Text style={[styles.sectionTitle, { backgroundColor: '#fef3c7', color: '#92400e' }]}>
          POR COMPRAR (PROVEEDOR)
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thCheck}>LISTO</Text>
            <Text style={styles.thQty}>CANT.</Text>
            <Text style={styles.thProduct}>PRODUCTO</Text>
          </View>
          {buyItems.length === 0 ? (
            <Text style={styles.emptyState}>No hay materiales pendientes por comprar</Text>
          ) : (
            buyItems.map((item: any, idx: number) => renderItem(item, idx))
          )}
        </View>

      </Page>
    </Document>
  );
};
