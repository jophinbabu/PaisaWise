"use client";

import { Document, Font, Page, PDFDownloadLink,StyleSheet, Text, View } from "@react-pdf/renderer";
import { format } from "date-fns";

// Register the Inter font
Font.register({
  family: "Inter",
  src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf",
});

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Inter",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 5,
    flex: 1,
    fontSize: 10,
  },
  total: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 12,
  },
});

// Balance Sheet PDF Component
export function BalanceSheetPDF({ data }) {
  const assets = data.filter((item) => item.type === "asset");
  const liabilities = data.filter((item) => item.type === "liability");

  const calculateTotal = (items) => {
    return items.reduce((acc, item) => acc + (item.flow === "inflow" ? item.amount : -item.amount), 0);
  };

  const assetsTotal = calculateTotal(assets);
  const liabilitiesTotal = calculateTotal(liabilities);
  const netBalance = assetsTotal + liabilitiesTotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Balance Sheet</Text>

          {/* Assets Table */}
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Assets</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Name</Text>
              <Text style={styles.tableCell}>Department</Text>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Amount</Text>
            </View>
            {assets.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.name}</Text>
                <Text style={styles.tableCell}>{item.department}</Text>
                <Text style={styles.tableCell}>{format(new Date(item.createdat), "PP")}</Text>
                <Text style={styles.tableCell}>
                  {item.flow === "inflow" ? "+" : "-"} ₹{item.amount}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.total}>Total Assets: ₹{assetsTotal}</Text>

          {/* Liabilities Table */}
          <Text style={{ fontSize: 16, marginBottom: 10, marginTop: 20 }}>Liabilities</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Name</Text>
              <Text style={styles.tableCell}>Department</Text>
              <Text style={styles.tableCell}>Date</Text>
              <Text style={styles.tableCell}>Amount</Text>
            </View>
            {liabilities.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.name}</Text>
                <Text style={styles.tableCell}>{item.department}</Text>
                <Text style={styles.tableCell}>{format(new Date(item.createdat), "PP")}</Text>
                <Text style={styles.tableCell}>
                  {item.flow === "inflow" ? "+" : "-"} ₹{item.amount}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.total}>Total Liabilities: ₹{liabilitiesTotal}</Text>

          {/* Net Balance */}
          <Text style={[styles.total, { marginTop: 30 }]}>Net Balance: ₹{netBalance}</Text>
        </View>
      </Page>
    </Document>
  );
}

// Download Button Component
export function DownloadBalanceSheetPDF({ data }) {
  return (
    <PDFDownloadLink
      document={<BalanceSheetPDF data={data} />}
      fileName="balance_sheet.pdf"
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {loading ? "Generating PDF..." : "Download PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}