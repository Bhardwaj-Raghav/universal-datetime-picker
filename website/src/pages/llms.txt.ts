import type { APIRoute } from "astro";
import {
  DOCS_NAV,
  GITHUB_URL,
  NPM_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
} from "../site.config";
import { FRAMEWORKS, FRAMEWORK_CARD_SUMMARY } from "../frameworks";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (
    site?.origin && !site.origin.includes("react-calendar-time.vercel.app")
      ? site.origin
      : SITE_ORIGIN
  ).replace(/\/$/, "");

  const docsLinks = DOCS_NAV.filter(
    (item): item is { href: string; label: string } =>
      item.type !== "heading" && "href" in item,
  )
    .map((item) => `- [${item.label}](${siteUrl}${item.href})`)
    .join("\n");

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

universal-datetime-picker is an open-source date picker, date time picker, datetime picker, and date range calendar. It ships native React components plus vanilla JS, Web Components, CDN, and thin Vue / Svelte / Angular registration helpers over the same core.

Install: \`npm install universal-datetime-picker\`

Entry points: \`universal-datetime-picker\` (React), \`./vanilla\`, \`./wc\`, \`./vue\`, \`./svelte\`, \`./angular\`, \`./core\`, \`./style.css\`.

There are no \`./solid\` or \`./preact\` exports. Solid and Preact use \`./wc\`. Preact may also use \`preact/compat\` with the React entry.

Custom elements: \`<datetime-picker>\`, \`<datetime-picker-input>\`, \`<datetime-picker-range>\`. Events: \`change\`, \`openchange\`.

CDN: jsDelivr IIFE at \`.../dist/cdn/universal-datetime-picker.iife.js\`; CSS at \`.../dist/style.css\`. Pin a version in production.

## Framework pages and playground

- [Examples playground](${siteUrl}/examples/): Interactive options + snippets
- [Home](${siteUrl}/): Vanilla mode switcher (no React on \`/\`)
${FRAMEWORKS.map((fw) => `- [${fw.label}](${siteUrl}/${fw.slug}/): ${FRAMEWORK_CARD_SUMMARY[fw.slug]}`).join("\n")}

## Docs

${docsLinks}
- [Full LLM context](${siteUrl}/llms-full.txt)
- [Changelog](${siteUrl}/changelog/)
- [README](${GITHUB_URL}/blob/main/README.md)
- [npm](${NPM_URL})

## Examples

- [Examples playground](${siteUrl}/examples/)
- [GitHub repository](${GITHUB_URL})
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
