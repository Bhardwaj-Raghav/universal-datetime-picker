import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL, siteOrigin: string) => `User-agent: *
Allow: /

# LLM-friendly site summary (https://llmstxt.org/)
# ${siteOrigin}/llms.txt
# ${siteOrigin}/llms-full.txt

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.origin || "https://universal-datetime-picker.vercel.app").replace(
    /\/$/,
    ""
  );
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL, origin));
};
