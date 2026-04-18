import Link from "next/link";
import Image from "next/image";

// ─── Data ────────────────────────────────────────────────────────────────────

const STEEL_GRADES = [
  {
    grade: "AISI 410",
    use: "Non-Cutting Instruments",
    note: "General surgical — non-cutting",
  },
  {
    grade: "AISI 420",
    use: "Cutting Instruments",
    note: "General surgical — cutting",
  },
  {
    grade: "AISI 304",
    use: "Tips of Scalars & Elevator Handles",
    note: "Austenitic — dental",
  },
  {
    grade: "AISI 410 & 420",
    use: "General Surgical Instruments",
    note: "Martensitic — surgical",
  },
];

const HARDNESS_TABLE = [
  { type: "410", hb: "210" },
  { type: "410X", hb: "220" },
  { type: "416", hb: "262" },
  { type: "416 Mod", hb: "262" },
  { type: "420A", hb: "220" },
  { type: "420B", hb: "235" },
  { type: "420 Mod", hb: "255" },
  { type: "420X", hb: "262" },
  { type: "420C", hb: "262" },
  { type: "420F", hb: "262" },
  { type: "420F Mod", hb: "262" },
  { type: "431", hb: "285" },
  { type: "440A", hb: "285" },
  { type: "440B", hb: "285" },
  { type: "440C", hb: "285" },
  { type: "440F", hb: "285" },
];

const PROCESSES = [
  { id: "hardness", number: "01", label: "Hardness" },
  { id: "corrosion", number: "02", label: "Corrosion Resistance" },
  { id: "elasticity", number: "03", label: "Elasticity" },
  { id: "cutting", number: "04", label: "Cutting" },
  { id: "visual-inspection", number: "05", label: "Visual Inspection" },
];

// ─── Small reusable components ────────────────────────────────────────────────

function SectionHeading({ number, title, id }) {
  return (
    <div id={id} className="flex items-start gap-4 scroll-mt-24">
      <span
        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-brand-primary text-white font-bold text-sm"
        aria-hidden="true"
      >
        {number}
      </span>
      <h2 className="text-xl font-bold text-gray-900 pt-1.5">{title}</h2>
    </div>
  );
}

function SubHeading({ children }) {
  return (
    <h3 className="font-semibold text-gray-800 text-base mt-5 mb-2">
      {children}
    </h3>
  );
}

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-2 text-gray-600 text-sm">
      {/* brand-primary checkmark on white = 5.88:1 — AA */}
      <svg
        className="mt-0.5 shrink-0 text-brand-primary"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function InfoBox({ children }) {
  return (
    <div className="bg-slate-50 border-l-4 border-brand-primary rounded-r-lg px-4 py-3 text-sm text-gray-700 leading-relaxed">
      {children}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Quality Control | Surgical Essence",
  description:
    "Learn how Surgical Essence ensures the highest quality in every surgical and dental instrument — from raw material selection to final visual inspection.",
};

export default function QualityControlPage() {
  return (
    <>
        {/* ── Hero ── */}
        <div className="relative bg-brand-primary text-white py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0" aria-hidden="true">
            <Image
              src="/images/Quality Control Image.jpg"
              alt=""
              fill
              className="object-cover opacity-20"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-brand-primary/70" />
          </div>
          <div className="relative max-w-7xl mx-auto">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
              Manufacturing Standards
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              Quality Control
            </h1>
            <p className="text-white/80 mt-2 text-base max-w-xl leading-relaxed">
              Every instrument we manufacture meets rigorous international
              standards — from raw material selection through to final
              inspection.
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
            {/* Sticky sidebar — process navigation */}
            <aside
              className="hidden lg:block"
              aria-label="Quality process sections"
            >
              <div className="sticky top-6">
                <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-3">
                  Quality Processes
                </p>
                <nav aria-label="On-page navigation">
                  <ul className="flex flex-col gap-1" role="list">
                    {PROCESSES.map((p) => (
                      <li key={p.id}>
                        <a
                          href={`#${p.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 font-medium hover:text-brand-primary hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors"
                        >
                          <span className="text-xs text-gray-400 font-mono">
                            {p.number}
                          </span>
                          {p.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* CTA */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    Have questions?
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Our team can advise on instrument specifications for your
                    requirements.
                  </p>
                  <Link
                    href="/contact"
                    className="block text-center text-sm font-semibold px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-col gap-12">
              {/* ── Material Selection ── */}
              <section aria-labelledby="material-heading">
                <h2
                  id="material-heading"
                  className="text-xl font-bold text-gray-900 mb-4"
                >
                  Material Selection
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  For manufacturing of surgical and dental instruments, Surgical
                  Essence first chooses the correct stainless steel grade for
                  the required instruments, drawing on
                  <strong className="text-gray-800">
                    {" "}
                    ASTM &amp; DIN standards
                  </strong>
                  , the DIN book, ISO's standard manual and other suitable
                  literature.
                </p>

                {/* Steel type cards */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {/* Austenitic */}
                  <div className="rounded-xl border border-gray-200 p-5 bg-white">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-primary bg-slate-50 px-2 py-0.5 rounded-full mb-3">
                      Non-Magnetic
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mb-1">
                      Austenitic Stainless Steel
                    </h3>
                    <p className="text-xs font-mono text-gray-500 mb-2">
                      AISI 300 Series
                    </p>
                    <p className="text-sm text-gray-600">
                      Used in combination with Martensitic steel for dental
                      instruments and specialty components such as scalar tips
                      and elevator handles (AISI 304).
                    </p>
                  </div>
                  {/* Martensitic */}
                  <div className="rounded-xl border border-brand-primary/30 p-5 bg-slate-50">
                    <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-primary bg-white px-2 py-0.5 rounded-full mb-3 border border-brand-primary/30">
                      Magnetic
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mb-1">
                      Martensitic Stainless Steel
                    </h3>
                    <p className="text-xs font-mono text-gray-500 mb-2">
                      AISI 400 Series
                    </p>
                    <p className="text-sm text-gray-600">
                      Primary choice for general surgical instruments. Grades
                      410 &amp; 420 are most widely used — 410 for non-cutting,
                      420 for cutting instruments.
                    </p>
                  </div>
                </div>

                {/* Grade quick reference */}
                <h3 className="font-semibold text-gray-800 text-base mb-3">
                  Grade Quick Reference
                </h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th
                          scope="col"
                          className="text-left px-4 py-3 font-semibold text-gray-700"
                        >
                          Grade
                        </th>
                        <th
                          scope="col"
                          className="text-left px-4 py-3 font-semibold text-gray-700"
                        >
                          Application
                        </th>
                        <th
                          scope="col"
                          className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell"
                        >
                          Series
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {STEEL_GRADES.map((row) => (
                        <tr
                          key={row.grade}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono font-semibold text-brand-primary">
                            {row.grade}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{row.use}</td>
                          <td className="px-4 py-3 text-gray-400 hidden sm:table-cell text-xs">
                            {row.note}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ── 1. Hardness ── */}
              <section aria-labelledby="hardness-title">
                <SectionHeading id="hardness" number="01" title="Hardness" />
                <div id="hardness-title" className="sr-only">
                  Hardness
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-5">
                  Material shall conform to the mechanical property requirements
                  below. The table lists Brinell Hardness maximums for Class 4
                  Martensitic Stainless Steels in the annealed condition.
                </p>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <caption className="sr-only">
                      Brinell Hardness Guidelines for Class 4 Martensitic
                      Stainless Steels (Annealed)
                    </caption>
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th
                          scope="col"
                          className="text-left px-5 py-3 font-semibold"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="text-right px-5 py-3 font-semibold"
                        >
                          Max Brinell Hardness (HB)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {HARDNESS_TABLE.map((row, i) => (
                        <tr
                          key={row.type}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-5 py-2.5 font-mono font-semibold text-gray-800">
                            {row.type}
                          </td>
                          <td className="px-5 py-2.5 text-right text-gray-600">
                            {row.hb}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ── 2. Corrosion Resistance ── */}
              <section aria-labelledby="corrosion-title">
                <SectionHeading
                  id="corrosion"
                  number="02"
                  title="Corrosion Resistance"
                />
                <div id="corrosion-title" className="sr-only">
                  Corrosion Resistance
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mt-4 mb-5">
                  Two test methods are specified for determining corrosion
                  resistance:
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <SubHeading>A — Copper Sulfate Resistance Test</SubHeading>
                    <ul className="flex flex-col gap-2 mt-2">
                      <CheckItem>
                        No copper deposit on the instruments.
                      </CheckItem>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <SubHeading>B — Boiled Water Resistance Test</SubHeading>
                    <ul className="flex flex-col gap-2 mt-2">
                      <CheckItem>No blemishes on the instrument.</CheckItem>
                      <CheckItem>No visible signs of corrosion.</CheckItem>
                    </ul>
                  </div>
                </div>
              </section>

              {/* ── 3. Elasticity ── */}
              <section aria-labelledby="elasticity-title">
                <SectionHeading
                  id="elasticity"
                  number="03"
                  title="Elasticity"
                />
                <div id="elasticity-title" className="sr-only">
                  Elasticity
                </div>

                <div className="mt-4 flex flex-col gap-5">
                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <SubHeading>
                      A — Needle Holders &amp; Haemostatic Forceps
                    </SubHeading>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      Place a plastic fiber (e.g. a suture filament) of maximum
                      diameter
                      <strong className="text-gray-800"> 0.2 mm</strong> between
                      the jaws within the third of the length nearest the tip.
                      Fully close the instrument and apply a tensile force of{" "}
                      <strong className="text-gray-800">20 N</strong> to the
                      fiber. Record whether the fiber is pulled out from the
                      jaws.
                    </p>
                    <InfoBox>
                      After the test, no distortion, cracks or any other
                      permanent modifications shall be visible.
                    </InfoBox>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <SubHeading>B — Haemostatic Forceps</SubHeading>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      Place a test wire between the tips of the instrument jaws.
                      Fully close the instrument to the last ratchet position.
                      Leave the instrument in this position for
                      <strong className="text-gray-800"> 3 hours</strong> at
                      room temperature. Examine for cracks and permanent
                      deformation.
                    </p>
                    <InfoBox>
                      After the test, no distortion, cracks or any other
                      permanent modifications shall be visible.
                    </InfoBox>
                  </div>
                </div>
              </section>

              {/* ── 4. Cutting ── */}
              <section aria-labelledby="cutting-title">
                <SectionHeading id="cutting" number="04" title="Cutting" />
                <div id="cutting-title" className="sr-only">
                  Cutting
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-4">
                  The cutting ability of instruments is tested as follows: the
                  testing material shall be cut non-stop{" "}
                  <strong className="text-gray-800">three times</strong> along
                  two-thirds of the blade without lateral pressure.
                </p>

                <ul className="flex flex-col gap-2.5">
                  <CheckItem>
                    The testing material shall be cut cleanly without tearing.
                  </CheckItem>
                  <CheckItem>
                    After the test, no distortion, cracks or any other permanent
                    modifications of the instrument shall be visible.
                  </CheckItem>
                </ul>
              </section>

              {/* ── 5. Visual Inspection ── */}
              <section aria-labelledby="visual-title">
                <SectionHeading
                  id="visual-inspection"
                  number="05"
                  title="Visual Inspection"
                />
                <div id="visual-title" className="sr-only">
                  Visual Inspection
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-4">
                  All instruments must pass the following inspections before
                  leaving the facility:
                </p>

                <ul className="flex flex-col gap-3">
                  <CheckItem>
                    Joints move smoothly — neither too loose nor too tight. It
                    shall be possible to close and reopen instruments easily
                    with two fingers.
                  </CheckItem>
                  <CheckItem>
                    All surfaces are free from pores, crevices and grinding
                    marks.
                  </CheckItem>
                  <CheckItem>
                    Instruments are supplied free from residual scale and
                    contamination.
                  </CheckItem>
                </ul>
              </section>

              {/* ── Standards reference ── */}
              <section
                aria-labelledby="standards-heading"
                className="rounded-xl bg-slate-900 text-white p-6"
              >
                <h2 id="standards-heading" className="text-base font-bold mb-3">
                  Referenced Standards
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {["ASTM", "DIN", "ISO"].map((std) => (
                    <li key={std}>
                      {/* white on slate-900 = 17.98:1 — AAA */}
                      <span className="px-3 py-1 rounded-full border border-slate-600 text-slate-300 text-sm font-mono">
                        {std}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Manufacturing processes conform to ASTM &amp; DIN standards,
                  ISO's standard manual and other applicable literature for
                  surgical instrument production.
                </p>
              </section>
            </div>
          </div>
        </div>
    </>
  );
}
