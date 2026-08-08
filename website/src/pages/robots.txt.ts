import type { APIRoute } from "astro";
import { SITE_ORIGIN } from "../site.config";

const getRobotsTxt = (sitemapURL: string, siteOrigin: string) => `User-agent: *
Allow: /

# LLM-friendly site summary (https://llmstxt.org/)
# ${siteOrigin}/llms.txt
# ${siteOrigin}/llms-full.txt

Sitemap: ${sitemapURL}
`;

export const GET: APIRoute = ({ site }) => {
  // Prefer Astro.site when it matches the canonical host; never emit the
  // redirected legacy host (breaks Google Search Console sitemap reads).
  const fromAstro = site?.origin?.replace(/\/$/, "");
  const origin =
    fromAstro && !fromAstro.includes("react-calendar-time.vercel.app")
      ? fromAstro
      : SITE_ORIGIN;
  const sitemapURL = `${origin}/sitemap.xml`;
  return new Response(getRobotsTxt(sitemapURL, origin), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};
