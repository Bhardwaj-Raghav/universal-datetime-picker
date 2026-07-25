import type { APIRoute } from "astro";
import { GITHUB_URL, NPM_URL, SITE_DESCRIPTION, SITE_NAME } from "../site.config";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (site?.origin || "https://react-calendar-time.vercel.app").replace(
    /\/$/,
    ""
  );

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

react-calendar-time is an open-source React date picker, time picker, datetime picker, and date range calendar. It ships TypeScript types, ESM/CJS builds, dayjs-powered values, CSS-variable theming (including dark mode), locales, and accessible keyboard navigation. Peer dependencies: react and react-dom (>= 17). License: MIT.

Install: \`npm install react-calendar-time\`

Primary exports: \`DateTime\`, \`DateTimeInput\` / \`DateTime.Input\`, \`DateTimeRange\` / \`DateTime.Range\`. Import styles from \`react-calendar-time/style.css\`.

## Docs

- [Live demo & docs site](${siteUrl}/): Interactive React date time picker demos, install snippet, and FAQ
- [Full LLM context](${siteUrl}/llms-full.txt): Expanded API summary, props, theming, and usage notes for agents
- [README (markdown)](${GITHUB_URL}/blob/main/README.md): Install, components, props, theming, locales
- [npm package](${NPM_URL}): Package metadata, versions, and install command

## Examples

- [Quick start](${GITHUB_URL}/blob/main/README.md#quick-start): Minimal DateTimeInput + inline DateTime usage
- [GitHub repository](${GITHUB_URL}): Source code, issues, and releases

## Optional

- [robots.txt](${siteUrl}/robots.txt): Crawler rules and sitemap
- [sitemap](${siteUrl}/sitemap-index.xml): Indexable site URLs
- [License](${GITHUB_URL}/blob/main/LICENSE): MIT license text
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
