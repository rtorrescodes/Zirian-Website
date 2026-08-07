import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';


// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#0066FF',
    paddingBottom: 20,
    marginBottom: 20,
  },
  logo: {
    width: 150,
  },
  headerText: {
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    color: '#0066FF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  quoteMeta: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  clientSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  clientText: {
    fontSize: 10,
    color: '#444',
    marginBottom: 4,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginBottom: 30,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    alignItems: 'center',
    height: 24,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    minHeight: 24,
    paddingVertical: 5,
  },
  colQty: {
    width: '10%',
    textAlign: 'center',
    fontSize: 10,
  },
  colDesc: {
    width: '50%',
    textAlign: 'left',
    fontSize: 10,
    paddingLeft: 8,
  },
  colPrice: {
    width: '20%',
    textAlign: 'right',
    fontSize: 10,
  },
  colTotal: {
    width: '20%',
    textAlign: 'right',
    fontSize: 10,
    paddingRight: 8,
  },
  totalsSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  totalValue: {
    fontSize: 10,
    color: '#333',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#888',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  notes: {
    fontSize: 9,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic'
  }
});

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

export const BaseQuotePdf = ({ quote, client }: { quote: any, client: any }) => {
  // Use absolute path for logo when generating on server
  const logoPath = typeof window !== 'undefined' ? '/assets/images/logo.png' : require('path').join(process.cwd(), 'public', 'assets', 'images', 'logo.png');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.title}>COTIZACIÓN</Text>
            <Text style={styles.quoteMeta}>Folio: ZIR-{quote.id.toString().padStart(4, '0')}</Text>
            <Text style={styles.quoteMeta}>
              Fecha: {new Date(quote.fecha_creacion).toLocaleDateString('es-MX')}
            </Text>
            {quote.validez_dias && (
              <Text style={styles.quoteMeta}>Válido por: {quote.validez_dias} días</Text>
            )}
          </View>
        </View>

        {/* CLIENT INFO */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <Text style={styles.clientText}>Nombre: {client.nombre}</Text>
          {client.empresa && <Text style={styles.clientText}>Empresa: {client.empresa}</Text>}
          {client.email && <Text style={styles.clientText}>Email: {client.email}</Text>}
          {client.telefono && <Text style={styles.clientText}>Teléfono: {client.telefono}</Text>}
          {client.ubicacion && <Text style={styles.clientText}>Ubicación: {client.ubicacion}</Text>}
          {client.marca_ev && <Text style={styles.clientText}>Vehículo: {client.marca_ev}</Text>}
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text style={styles.colQty}>Cant.</Text>
            <Text style={styles.colDesc}>Descripción</Text>
            <Text style={styles.colPrice}>Precio Unit.</Text>
            <Text style={styles.colTotal}>Importe</Text>
          </View>
          
          {quote.items.map((item: any, i: number) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colQty}>{Number(item.cantidad)}</Text>
              <Text style={styles.colDesc}>{item.descripcion}</Text>
              <Text style={styles.colPrice}>{formatCurrency(Number(item.precio_unitario))}</Text>
              <Text style={styles.colTotal}>{formatCurrency(Number(item.total))}</Text>
            </View>
          ))}
        </View>

        {/* TOTALS */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(Number(quote.subtotal))}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (16%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(Number(quote.impuestos))}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(Number(quote.total))}</Text>
          </View>
        </View>

        {/* NOTES & CONDITIONS */}
        {(quote.notas_internas || quote.condiciones) && (
          <View style={{ marginTop: 20 }}>
            {quote.condiciones && (
              <>
                <Text style={styles.sectionTitle}>Condiciones</Text>
                <Text style={styles.clientText}>{quote.condiciones}</Text>
              </>
            )}
            {quote.notas_internas && (
              <Text style={styles.notes}>* Notas: {quote.notas_internas}</Text>
            )}
          </View>
        )}

        {/* FOOTER */}
        <Text style={styles.footer} fixed>
          Zirian S.A. de C.V. | Especialistas en Instalaciones para Vehículos Eléctricos | zirian.com
        </Text>
      </Page>
    </Document>
  );
};
