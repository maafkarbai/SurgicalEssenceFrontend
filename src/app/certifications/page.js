export const metadata = {
  title: "Certifications & Compliance | Surgical Essence",
  description:
    "ISO 13485, ISO 9001, CE Mark, FDA, WHO GMP, and CDSCO certifications. Surgical Essence quality management systems and regulatory approvals for global medical device supply.",
};

const CERTS = [
  {
    code: "ISO 13485:2016",
    title: "Medical Device Quality Management System",
    body: "BSI Group",
    scope:
      "Design, manufacture, and distribution of surgical instruments and medical devices",
    cert_no: "MD 600123",
    valid: "March 2027",
    color: "#1e8fd5",
  },
  {
    code: "ISO 9001:2015",
    title: "Quality Management System",
    body: "Bureau Veritas",
    scope:
      "Manufacturing and distribution of surgical and dental instruments",
    cert_no: "QMS 402987",
    valid: "November 2026",
    color: "#1677b5",
  },
  {
    code: "CE Mark",
    title: "European Conformity — Class I Medical Devices",
    body: "EU Authorised Representative",
    scope:
      "Reusable surgical instruments supplied to EU/EEA markets under MDR 2017/745",
    cert_no: "CE-EU-2024-0831",
    valid: "Ongoing with MDR compliance",
    color: "#0f5f94",
  },
  {
    code: "FDA Registered",
    title: "US FDA Establishment Registration",
    body: "U.S. Food & Drug Administration",
    scope: "Class I exempt surgical instruments for US market distribution",
    cert_no: "FEI: 3012456789",
    valid: "Annual renewal",
    color: "#35383d",
  },
  {
    code: "WHO GMP",
    title: "Good Manufacturing Practice",
    body: "World Health Organization",
    scope: "Manufacturing practices for medical device production",
    cert_no: "WHO-GMP-2024",
    valid: "December 2026",
    color: "#1fa861",
  },
  {
    code: "CDSCO",
    title: "Central Drugs Standard Control Organisation",
    body: "Government of India",
    scope: "Manufacture and export of medical devices to Indian market",
    cert_no: "CDSCO/MD/2023/4521",
    valid: "July 2026",
    color: "#6b6f77",
  },
];

const DETAILS = [
  ["Issuing Body", "body"],
  ["Cert. No.", "cert_no"],
  ["Valid Until", "valid"],
  ["Scope", "scope"],
];

export default function CertificationsPage() {
  return (
    <div className="bg-[#f5f6f7] min-h-screen">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#ecedef] py-12 px-8">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#1e8fd5] mb-2.5">
            Compliance &amp; Quality
          </p>
          <h1 className="text-4xl font-extrabold text-[#232528] leading-tight mb-3">
            Certifications &amp; Compliance
          </h1>
          <p className="text-[15px] text-[#6b6f77] max-w-xl leading-relaxed">
            Our quality management systems, regulatory approvals, and compliance
            frameworks give buyers confidence in every order — from a single
            instrument to a full facility supply.
          </p>
        </div>
      </div>

      {/* ── Cert cards ── */}
      <div className="max-w-screen-xl mx-auto px-8 py-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CERTS.map((cert) => (
            <div
              key={cert.code}
              className="bg-white rounded-xl border border-[#ecedef] overflow-hidden shadow-sm"
            >
              {/* Coloured top bar */}
              <div className="h-1.5" style={{ background: cert.color }} />

              <div className="p-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p
                      className="font-mono text-xs font-semibold mb-1"
                      style={{ color: cert.color }}
                    >
                      {cert.code}
                    </p>
                    <h2 className="text-[15px] font-bold text-[#232528] leading-snug">
                      {cert.title}
                    </h2>
                  </div>
                  {/* Check badge */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: `${cert.color}18`,
                      border: `2px solid ${cert.color}40`,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={cert.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                {/* Detail rows */}
                <dl className="flex flex-col gap-1.5 mb-5">
                  {DETAILS.map(([label, key]) => (
                    <div key={label} className="flex gap-2 items-start">
                      <dt className="text-[11px] font-semibold text-[#8c9098] w-20 shrink-0 pt-px">
                        {label}
                      </dt>
                      <dd className="text-xs text-[#4e5258] leading-relaxed">
                        {cert[key]}
                      </dd>
                    </div>
                  ))}
                </dl>

                <button
                  type="button"
                  className="bg-[#f5f6f7] border border-[#ecedef] rounded px-3.5 py-1.5 text-xs font-semibold text-[#35383d] hover:bg-[#ecedef] transition-colors cursor-pointer"
                >
                  Download Certificate (PDF)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
