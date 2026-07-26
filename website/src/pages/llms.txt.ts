import type { APIRoute } from "astro";
import { GITHUB_URL, NPM_URL, SITE_DESCRIPTION, SITE_NAME } from "../site.config";
import { FRAMEWORKS, FRAMEWORK_CARD_SUMMARY } from "../frameworks";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (site?.origin || "https://universal-datetime-picker.vercel.app").replace(
    /\/$/,
    ""
  );

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

universal-datetime-picker is an open-source date picker, time picker, datetime picker, and date range calendar for React, Vue, Svelte, Angular, vanilla JS, and CDN. It ships TypeScript types, ESM/CJS builds, Web Components, a vanilla mount API, dayjs-powered values, CSS-variable theming, locales, and accessible keyboard navigation. React peers (>= 18) are optional when using vanilla/WC/CDN. License: MIT.

Install: \`npm install universal-datetime-picker\`

Entry points: \`universal-datetime-picker\` (React), \`./vanilla\`, \`./wc\`, \`./vue\`, \`./svelte\`, \`./angular\`, \`./core\`, \`./style.css\`.

Custom elements: \`<datetime-picker>\`, \`<datetime-picker-input>\`, \`<datetime-picker-range>\` — listen for \`change\` CustomEvent (\`detail\` = value).

CDN: \`https://cdn.jsdelivr.net/npm/universal-datetime-picker\` (+ \`/style.css\`).

## Framework live demos

- [Vanilla JS home](${siteUrl}/): All examples via \`createDateTimePicker\` (no React on \`/\`)
${FRAMEWORKS.map((fw) => `- [${fw.label}](${siteUrl}/${fw.slug}/): ${FRAMEWORK_CARD_SUMMARY[fw.slug]}`).join("\n")}

## Docs

- [Live demo & docs site](${siteUrl}/): Interactive demos, multi-framework install, and FAQ
- [Full LLM context](${siteUrl}/llms-full.txt): Expanded API summary, props, theming, and usage notes for agents
- [README (markdown)](${GITHUB_URL}/blob/main/README.md): Install, components, props, theming, locales
- [npm package](${NPM_URL}): Package metadata, versions, and install command

## Examples

- [Quick start](${GITHUB_URL}/blob/main/README.md#quick-start-react): Minimal DateTimeInput + inline DateTime usage
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
