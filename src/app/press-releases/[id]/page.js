import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getArticle(id) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/press-releases/${id}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: "Not found" };
  return {
    title: `${article.title} | Surgical Essence`,
    description: article.content.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: { images: article.imageUrl ? [article.imageUrl] : [] },
  };
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function readingTime(html) {
  const text  = html.replace(/<[^>]+>/g, "");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function PressReleaseArticlePage({ params }) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  const mins = readingTime(article.content);

  return (
    <>
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          href="/press-releases"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          All press releases
        </Link>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 pt-6">

        {/* Meta */}
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 pb-6 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Surgical Essence</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{mins} min read</span>
          </div>
        </header>

        {/* Cover image */}
        {article.imageUrl && (
          <div className="relative w-full aspect-[2/1] rounded-md overflow-hidden mb-10 bg-gray-100">
            <Image
              src={article.imageUrl}
              alt={`Cover image for ${article.title}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Body */}
        <div
          className="article-body text-gray-800"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Surgical Essence</p>
            <p className="text-xs text-gray-500">Sialkot, Pakistan · Precision Surgical Instruments</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Get a Quote
          </Link>
        </footer>
      </article>
    </>
  );
}
