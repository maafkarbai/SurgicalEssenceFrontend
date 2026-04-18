// Shared product data — imported by the products page, search modal, and any
// future features that need to query instruments.

export const CATEGORY_LABELS = {
  surgical:    "Surgical",
  dental:      "Dental",
  beauty:      "Beauty Care",
  ophthalmic:  "Ophthalmic",
  "single-use": "Single Use",
};

export const QUICK_LINKS = [
  { label: "All Instruments",        href: "/products",                  key: "all"        },
  { label: "Surgical Instruments",   href: "/products?cat=surgical",     key: "surgical"   },
  { label: "Dental Instruments",     href: "/products?cat=dental",       key: "dental"     },
  { label: "Beauty Care",            href: "/products?cat=beauty",       key: "beauty"     },
  { label: "Ophthalmic Instruments", href: "/products?cat=ophthalmic",   key: "ophthalmic" },
  { label: "Single Use Instruments", href: "/products?cat=single-use",   key: "single-use" },
];

export const PRODUCTS = [
  // Surgical
  { id: 25, category: "surgical",   sku: "SRG-001", name: "Mayo Scissors Straight",     description: "Heavy-duty straight scissors for cutting fascia, sutures, and dressings in general surgery.",               material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-1.jpg"   },
  { id: 26, category: "surgical",   sku: "SRG-002", name: "Metzenbaum Scissors Curved", description: "Delicate curved scissors for dissecting soft tissue in abdominal and thoracic procedures.",                  material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-2.jpg"   },
  { id: 27, category: "surgical",   sku: "SRG-003", name: "Tissue Forceps 1×2",         description: "Toothed thumb forceps for gripping and manipulating tissue during open surgical procedures.",                material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-3.jpg"   },
  { id: 28, category: "surgical",   sku: "SRG-004", name: "Kocher Hemostatic Clamp",    description: "Heavy-duty locking clamp for clamping thick tissue, fascia, and controlling bleeding vessels.",             material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-4.jpg"   },
  { id: 29, category: "surgical",   sku: "SRG-005", name: "Langenbeck Retractor",       description: "Single-ended blade retractor for retracting wound edges to provide clear surgical access.",                  material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/retractor-1.jpg" },
  { id: 30, category: "surgical",   sku: "SRG-006", name: "Needle Holder Mayo-Hegar",   description: "Standard-length needle holder with serrated jaws for suturing in general surgical procedures.",             material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-5.jpg"   },

  // Dental
  { id: 1,  category: "dental",     sku: "DEN-001", name: "Extraction Forceps",         description: "Premium stainless steel forceps for upper and lower molar extractions with ergonomic handles.",             material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-6.jpg"   },
  { id: 2,  category: "dental",     sku: "DEN-002", name: "Periodontal Curette",        description: "Double-ended curette for precise scaling, root planing and subgingival debridement.",                        material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/probe-1.jpg"     },
  { id: 3,  category: "dental",     sku: "DEN-003", name: "Dental Mirror Set",          description: "Rhodium-coated front-surface mirrors for clear oral cavity examination. Set of 5 sizes.",                   material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/probe-2.jpg"     },
  { id: 4,  category: "dental",     sku: "DEN-004", name: "Probe Explorer",             description: "Double-ended explorer for caries detection and cavity examination under magnification.",                      material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/probe-3.jpg"     },
  { id: 5,  category: "dental",     sku: "DEN-005", name: "Bone Rongeur",               description: "Heavy-duty rongeur for alveolar bone trimming during oral surgical procedures.",                             material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-7.jpg"   },
  { id: 6,  category: "dental",     sku: "DEN-006", name: "Saliva Ejector Tips",        description: "Flexible disposable saliva ejector tips compatible with all standard dental units.",                         material: "Medical Plastic",       certifications: ["CE Certified", "Single Use / Sterile"],    image: "/images/products/blade-1.jpg"     },

  // Beauty Care
  { id: 7,  category: "beauty",     sku: "BTY-001", name: "Eyebrow Shaping Scissors",  description: "Micro-tip precision scissors with curved blade for detailed eyebrow and facial hair grooming.",             material: "German Steel",          certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-8.jpg"   },
  { id: 8,  category: "beauty",     sku: "BTY-002", name: "Spring Cuticle Nipper",     description: "Spring-loaded jaw nipper with ultra-sharp blades for professional cuticle trimming.",                        material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-9.jpg"   },
  { id: 9,  category: "beauty",     sku: "BTY-003", name: "Comedone Extractor Set",    description: "5-piece professional extractor set for blackhead and whitehead removal in skincare.",                         material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-10.jpg"  },
  { id: 10, category: "beauty",     sku: "BTY-004", name: "Nail Clipper Pro",           description: "Heavy-duty nail clipper with wide-jaw curved blade for salon and podiatry use.",                             material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-7.jpg"   },
  { id: 11, category: "beauty",     sku: "BTY-005", name: "Ingrown Nail File",          description: "Flat-tipped nail file designed to relieve ingrown toenail edges safely.",                                    material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/blade-2.jpg"     },
  { id: 12, category: "beauty",     sku: "BTY-006", name: "Tweezer Precision Set",      description: "Three-piece slant, point and flat tweezer set for professional beauty applications.",                        material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-2.jpg"   },

  // Ophthalmic
  { id: 13, category: "ophthalmic", sku: "OPH-001", name: "Iris Scissors",              description: "Fine curved scissors for delicate iris, conjunctival and capsular incision procedures.",                    material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-1.jpg"   },
  { id: 14, category: "ophthalmic", sku: "OPH-002", name: "Corneal Forceps",            description: "1×2 teeth toothed forceps engineered for precise corneal tissue handling.",                                 material: "Titanium",              certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-3.jpg"   },
  { id: 15, category: "ophthalmic", sku: "OPH-003", name: "Wire Eye Speculum",          description: "Adjustable wire lid speculum for eyelid retraction during anterior segment surgery.",                       material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/retractor-2.jpg" },
  { id: 16, category: "ophthalmic", sku: "OPH-004", name: "Lacrimal Cannula Set",       description: "6-piece set of blunt cannulas for lacrimal duct irrigation and syringing.",                                material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/probe-2.jpg"     },
  { id: 17, category: "ophthalmic", sku: "OPH-005", name: "Lens Implantation Forceps",  description: "IOL insertion forceps with cross-action handle for cataract surgery procedures.",                          material: "Titanium",              certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/forceps-4.jpg"   },
  { id: 18, category: "ophthalmic", sku: "OPH-006", name: "Strabismus Hook",            description: "Smooth muscle hook for squint correction and extraocular muscle isolation.",                                material: "Stainless Steel",       certifications: ["CE Certified", "Reusable / Sterilizable"], image: "/images/products/probe-1.jpg"     },

  // Single Use
  { id: 19, category: "single-use", sku: "SU-001",  name: "Disposable Scalpel #10",    description: "Pre-sterilised single-use scalpel with integrated polypropylene handle. Box of 10.",                      material: "Carbon Steel Blade",    certifications: ["CE Certified", "Single Use / Sterile"],    image: "/images/products/scalpel-1.jpg"   },
  { id: 20, category: "single-use", sku: "SU-002",  name: "Safety Lancets",            description: "Retractable safety lancets for capillary blood sampling. Sterile, single use. Box of 100.",               material: "Stainless Steel",       certifications: ["CE Certified", "Single Use / Sterile"],    image: "/images/products/blade-1.jpg"     },
  { id: 21, category: "single-use", sku: "SU-003",  name: "Sterile Needle Holder",     description: "Disposable needle holder for suturing in sterile fields. Eliminates cross-contamination.",               material: "Stainless Steel",       certifications: ["CE Certified", "Single Use / Sterile"],    image: "/images/products/forceps-5.jpg"   },
  { id: 22, category: "single-use", sku: "SU-004",  name: "Disposable Trocar 5mm",     description: "Single-use 5 mm trocar with safety shield for minimally invasive laparoscopic entry.",                  material: "Medical Grade Plastic", certifications: ["CE Certified", "Single Use / Sterile"],    image: "/images/products/scalpel-2.jpg"   },
  { id: 23, category: "single-use", sku: "SU-005",  name: "Skin Stapler 35W",          description: "Disposable wide skin stapler loaded with 35 stainless steel staples for wound closure.",                 material: "Stainless Steel",       certifications: ["CE Certified", "Single Use / Sterile"],    image: "/images/products/blade-2.jpg"     },
  { id: 24, category: "single-use", sku: "SU-006",  name: "Surgical Skin Marker",      description: "Sterile, dual-tip surgical marking pen with ruler. Ink is skin-safe and water-resistant.",              material: "Medical Ink",           certifications: ["CE Certified", "Single Use / Sterile"],    image: "/images/products/scalpel-3.jpg"   },
];

/**
 * Search products by name, description, material, or category.
 * Returns up to `limit` results, sorted by name-match first.
 */
export function searchProducts(query, limit = 10) {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const nameMatches = [];
  const otherMatches = [];

  for (const p of PRODUCTS) {
    const inName     = p.name.toLowerCase().includes(q);
    const inDesc     = p.description.toLowerCase().includes(q);
    const inMaterial = p.material.toLowerCase().includes(q);
    const inCategory = CATEGORY_LABELS[p.category]?.toLowerCase().includes(q);

    if (inName) {
      nameMatches.push(p);
    } else if (inDesc || inMaterial || inCategory) {
      otherMatches.push(p);
    }
  }

  return [...nameMatches, ...otherMatches].slice(0, limit);
}
