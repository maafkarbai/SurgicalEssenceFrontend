"use client";

export default function NewsletterForm() {
  return (
    <div>
      <label
        htmlFor="newsletter-email"
        className="block text-xs text-gray-500 uppercase tracking-wide font-bold mb-2"
      >
        Newsletter
      </label>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex gap-2"
        aria-label="Newsletter signup"
      >
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="Your email address"
          className="flex-1 min-w-0 text-sm px-3 py-2 rounded border border-slate-300 bg-white text-[#444444] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00529b] focus:border-transparent"
        />
        <button
          type="submit"
          className="shrink-0 bg-[#00529b] hover:bg-[#003d75] text-white text-sm font-semibold px-4 py-2 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00529b]"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
