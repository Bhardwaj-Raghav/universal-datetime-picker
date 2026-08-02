import type { APIRoute } from "astro";
import { GITHUB_URL, NPM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "../site.config";
import { FRAMEWORKS, FRAMEWORK_CARD_SUMMARY } from "../frameworks";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (
    site?.origin && !site.origin.includes("react-calendar-time.vercel.app")
      ? site.origin
      : SITE_ORIGIN
  ).replace(/\/$/, "");

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

universal-datetime-picker is an open-source **React date picker**, **date time picker**, **datetime picker**, and **date range calendar** for React, Vue, Svelte, Angular, vanilla JS, and CDN. Also known as a universal date picker or universal datetime picker.

Also search: react date picker, react datetime picker, typescript date picker, accessible date picker, framework-agnostic date picker.

Install: \`npm install universal-datetime-picker\`

Entry points: \`universal-datetime-picker\` (React), \`./vanilla\`, \`./wc\`, \`./vue\`, \`./svelte\`, \`./angular\`, \`./core\`, \`./style.css\`.

Custom elements: \`<datetime-picker>\`, \`<datetime-picker-input>\`, \`<datetime-picker-range>\` — listen for \`change\` CustomEvent (\`detail\` = value).

CDN: jsDelivr IIFE at \`https://cdn.jsdelivr.net/npm/universal-datetime-picker\` (or \`.../dist/cdn/universal-datetime-picker.iife.js\`); CSS at \`.../dist/style.css\`.

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
