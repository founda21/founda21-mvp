import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

// A4 width in points (595.28) — sized so this fits edge-to-edge across the
// bottom of an A4 poster the funder designs themselves, not a full page of
// its own. Compact on purpose (§ "shouldn't take much space").
const CARD_WIDTH = 595;
const CARD_HEIGHT = 150;

const styles = StyleSheet.create({
  page: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    margin: 8,
    borderWidth: 1.5,
    borderColor: "#01884E",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    padding: 14,
    fontFamily: "Helvetica",
    color: "#0A1F44",
  },
  column: {
    flexDirection: "column",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#E5E9F0",
    marginHorizontal: 14,
  },
  badge: {
    fontSize: 7,
    letterSpacing: 1.2,
    color: "#01884E",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  wordmarkRow: {
    flexDirection: "row",
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  navy: { color: "#0A1F44" },
  emerald: { color: "#01884E" },
  institutionName: {
    fontSize: 9,
    color: "#5A6B8C",
    maxWidth: 140,
  },
  passcodeLabel: {
    fontSize: 7,
    letterSpacing: 1,
    color: "#5A6B8C",
    marginBottom: 2,
  },
  passcode: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  instruction: {
    fontSize: 8,
    color: "#5A6B8C",
    marginTop: 4,
    maxWidth: 150,
    lineHeight: 1.3,
  },
  requirementLabel: {
    fontSize: 7,
    letterSpacing: 1,
    color: "#01884E",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  signInButton: {
    backgroundColor: "#01884E",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  signInButtonText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  requirementDetail: {
    fontSize: 8,
    color: "#5A6B8C",
    marginTop: 5,
    maxWidth: 150,
    lineHeight: 1.3,
  },
});

export function CohortCard({
  institutionName,
  inviteCode,
  siteUrl,
}: {
  institutionName: string;
  inviteCode: string;
  siteUrl: string;
}) {
  return (
    <Document>
      <Page size={[CARD_WIDTH, CARD_HEIGHT]} style={styles.page}>
        <View style={styles.card}>
          <View style={styles.column}>
            <Text style={styles.badge}>IN PARTNERSHIP WITH</Text>
            <View style={styles.wordmarkRow}>
              <Text style={styles.navy}>Fo</Text>
              <Text style={styles.emerald}>u</Text>
              <Text style={styles.navy}>nda</Text>
              <Text style={styles.emerald}>21</Text>
            </View>
            <Text style={styles.institutionName}>{institutionName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.column}>
            <Text style={styles.passcodeLabel}>JOIN WITH PASSCODE</Text>
            <Text style={styles.passcode}>{inviteCode}</Text>
            <Text style={styles.instruction}>
              Go to {siteUrl.replace(/^https?:\/\//, "")}/get-started, choose &quot;I&apos;m a founder&quot;.
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.column}>
            <Text style={styles.requirementLabel}>TO BE CONSIDERED</Text>
            <View style={styles.signInButton}>
              <Text style={styles.signInButtonText}>Sign in now</Text>
            </View>
            <Text style={styles.requirementDetail}>
              We&apos;ll confirm which stage and the deadline once recruitment closes, so everyone gets equal time.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
