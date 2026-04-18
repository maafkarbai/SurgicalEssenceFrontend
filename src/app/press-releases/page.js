import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Press Releases | Surgical Essence",
  description: "Latest news and press releases from Surgical Essence — surgical instrument manufacturer in Sialkot, Pakistan.",
};

const PAGE_SIZE = 12;

async function getPressReleases(page = 1) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/press-releases?page=${page}&limit=${PAGE_SIZE}`,
      { next: { revalidate: 60 } }
    );
    const json = await res.json();
    return { items: json.data ?? [], meta: json.meta ?? { total: 0, totalPages: 1, page: 1 } };
  } catch {
    return { items: [], meta: { total: 0, totalPages: 1, page: 1 } };
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PressReleasesPage({ searchParams }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { items, meta } = await getPressReleases(page);

  return (
    <>
      {/* Header */}
      <div className="bg-brand-primary text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">News</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Press Releases</h1>
          <p className="mt-2 text-white/80 text-base max-w-xl">
            Latest updates, announcements, and news from Surgical Essence.
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F"
                strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">No press releases yet</h2>
            <p className="mt-2 text-gray-500 text-sm max-w-sm">
              We will publish company news, product launches, and announcements here. Check back soon.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-semibold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Contact Us
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/press-releases/${item.slug ?? item.id}`}
                  className="group flex flex-col bg-white rounded-md border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  {/* Cover image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-slate-50 text-white/70">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-10 h-10 opacity-40">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5 gap-2">
                    <p className="text-xs text-gray-400 font-medium">
                      {formatDate(item.publishedAt)}
                    </p>
                    <h2 className="font-bold text-gray-900 text-base leading-snug group-hover:text-brand-primary group-hover:underline transition-colors line-clamp-3">
                      {item.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
                      Surgical Essence
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <nav aria-label="Press releases pagination" className="mt-12 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/press-releases?page=${page - 1}`}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    ← Previous
                  </Link>
                )}

                <span className="px-4 py-2 text-sm text-gray-500">
                  Page {meta.page} of {meta.totalPages}
                </span>

                {page < meta.totalPages && (
                  <Link
                    href={`/press-releases?page=${page + 1}`}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}
