export type FrameworkSlug =
  | "react"
  | "vue"
  | "svelte"
  | "angular"
  | "vanilla"
  | "web-components"
  | "cdn"
  | "solid"
  | "preact"
  | "nextjs"
  | "nuxt";

export type FrameworkDef = {
  slug: FrameworkSlug;
  label: string;
  tagline: string;
  intro: string;
  pageTitle: string;
  pageDescription: string;
  pageKeywords: string;
  install: string;
  demoKind: "react" | "vue" | "svelte" | "solid" | "preact" | "vanilla-mount" | "wc" | "cdn";
  snippets: { title: string; code: string }[];
  notes: string[];
};

const REACT_SNIPPET = `import { useState } from "react";
import DateTime, { DateTimeInput, DateTimeRange } from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

export function BookingForm() {
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState({ start: null, end: null });

  return (
    <>
      <DateTimeInput
        asString={false}
        value={date}
        onChange={(next) => setDate(next instanceof Date ? next : null)}
        placeholder="Pick date & time"
        use12Hours
      />
      <DateTime inline mode="date" asString={false} value={date} onChange={setDate} />
      <DateTimeRange inline asString={false} value={range} onChange={setRange} />
    </>
  );
}`;

export const FRAMEWORKS: FrameworkDef[] = [
  {
    slug: "react",
    label: "React",
    tagline: "Native components with optional React 18+ peers.",
    pageTitle: "Universal DateTime Picker — React Live Demo",
    pageDescription:
      "Try DateTime, DateTimeInput, and DateTimeRange in React. Native components, TypeScript types, and accessible keyboard navigation—no Web Components required.",
    pageKeywords:
      "react date picker, react date time picker, react datetime picker, date range picker",
    intro:
      "Use native React components for date, time, datetime, and range selection. No Web Components required. Import DateTime, DateTimeInput, and DateTimeRange from the main package entry, enable universal-datetime-picker/style.css once, and set asString={false} when you want Date or TimeValue objects from onChange.",
    install: "npm install universal-datetime-picker",
    demoKind: "react",
    snippets: [
      { title: "React app", code: REACT_SNIPPET },
    ],
    notes: [
      "Import from universal-datetime-picker and universal-datetime-picker/style.css.",
      "Set asString={false} when you want Date or TimeValue objects from onChange.",
    ],
  },
  {
    slug: "vue",
    label: "Vue",
    tagline: "Web Components with defineCustomElements from ./vue.",
    pageTitle: "Universal DateTime Picker — Vue Integration",
    pageDescription:
      "Live Vue 3 demo of datetime-picker custom elements. Register once with defineCustomElements, listen with @change, and share the same themes as React.",
    pageKeywords: "vue date picker, vue date time picker, vue 3 datetime picker",
    intro:
      "Vue 3 apps register datetime-picker custom elements once (main.ts or a plugin), then use tags in templates with @change handlers. Configure compilerOptions.isCustomElement for datetime-picker* so Vue treats them as native custom elements. The live demo below mirrors a typical SFC setup.",
    install: "npm install universal-datetime-picker",
    demoKind: "vue",
    snippets: [
      {
        title: "main.ts",
        code: `import { createApp } from "vue";
import App from "./App.vue";
import { defineCustomElements } from "universal-datetime-picker/vue";
import "universal-datetime-picker/style.css";

defineCustomElements();

createApp(App)
  .config.compilerOptions.isCustomElement = (tag) =>
    tag.startsWith("datetime-picker")
  .mount("#app");`,
      },
      {
        title: "App.vue",
        code: `<script setup lang="ts">
import { ref } from "vue";

const date = ref<Date | null>(null);

function onChange(e: CustomEvent) {
  const next = e.detail;
  date.value = next instanceof Date ? next : null;
}
</script>

<template>
  <datetime-picker
    inline
    mode="date"
    as-string="false"
    @change="onChange"
  />
  <p>Selected: {{ date }}</p>
</template>`,
      },
    ],
    notes: [
      "Register elements once in main.ts (or a Nuxt .client plugin), not in every SFC.",
      "Set compilerOptions.isCustomElement for datetime-picker* so Vue 3 does not warn.",
      "Listen for @change; event.detail is the selected value.",
    ],
  },
  {
    slug: "svelte",
    label: "Svelte",
    tagline: "Custom elements with onchange in Svelte 5.",
    pageTitle: "Universal DateTime Picker — Svelte Integration",
    pageDescription:
      "Live Svelte demo: register datetime-picker elements once, bind onchange, and reuse the shared stylesheet and themes.",
    pageKeywords: "svelte date picker, svelte date time picker, svelte datetime picker",
    intro:
      "Svelte projects call defineCustomElements() from universal-datetime-picker/svelte during app startup, then bind onchange on datetime-picker, datetime-picker-input, or datetime-picker-range. You get the same calendar UI as React with Svelte-friendly event wiring and shared CSS-variable theming.",
    install: "npm install universal-datetime-picker",
    demoKind: "svelte",
    snippets: [
      {
        title: "+layout.ts (register once)",
        code: `import { defineCustomElements } from "universal-datetime-picker/svelte";
import "universal-datetime-picker/style.css";

defineCustomElements();`,
      },
      {
        title: "Page component",
        code: `<script lang="ts">
  let date = $state<Date | null>(null);

  function onChange(e: CustomEvent) {
    const next = e.detail;
    date = next instanceof Date ? next : null;
  }
</script>

<datetime-picker inline mode="date" as-string="false" onchange={onChange}></datetime-picker>
<p>Selected: {date ?? "null"}</p>`,
      },
    ],
    notes: [
      "Call defineCustomElements() once in root +layout.ts (or equivalent app entry), not in every component.",
      "On Svelte 5 custom elements, use onchange={...} for the native change CustomEvent (not on:change).",
      "Use explicit closing tags for custom elements (Svelte 5 rejects self-closing non-void tags).",
      "The svelte entry also exports a calendarTime action that only registers elements.",
    ],
  },
  {
    slug: "angular",
    label: "Angular",
    tagline: "CUSTOM_ELEMENTS_SCHEMA + registerDateTimePickerElements().",
    pageTitle: "Universal DateTime Picker — Angular Integration",
    pageDescription:
      "Live Angular demo using datetime-picker custom elements after registerDateTimePickerElements and CUSTOM_ELEMENTS_SCHEMA.",
    pageKeywords: "angular date picker, angular date time picker, angular datetime picker",
    intro:
      "Angular integrates via registerDateTimePickerElements() in main.ts and CUSTOM_ELEMENTS_SCHEMA on standalone components or NgModules. Templates use familiar (change) bindings; event.detail carries the selected value. This page’s demo runs the same elements your Angular app renders.",
    install: "npm install universal-datetime-picker",
    demoKind: "wc",
    snippets: [
      {
        title: "main.ts / AppModule",
        code: `import { registerDateTimePickerElements } from "universal-datetime-picker/angular";
import "universal-datetime-picker/style.css";

registerDateTimePickerElements();`,
      },
      {
        title: "Standalone component",
        code: `import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

@Component({
  selector: "app-booking",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`
    <datetime-picker
      inline
      mode="date"
      as-string="false"
      (change)="onChange($event.detail)"
    ></datetime-picker>
  \`,
})
export class BookingComponent {
  date: Date | null = null;

  onChange(detail: unknown) {
    this.date = detail instanceof Date ? detail : null;
  }
}`,
      },
    ],
    notes: [
      "The live demo on this page uses the same custom elements your Angular app renders.",
      "Add CUSTOM_ELEMENTS_SCHEMA (or define elements in a module) so Angular accepts the tags.",
    ],
  },
  {
    slug: "vanilla",
    label: "Vanilla JS",
    tagline: "createDateTimePicker imperative mount API.",
    pageTitle: "Universal DateTime Picker — Vanilla JavaScript",
    pageDescription:
      "Mount createDateTimePicker without a framework. Live demo of inline calendars and popovers with the imperative vanilla API.",
    pageKeywords:
      "vanilla js date picker, javascript date time picker, createDateTimePicker",
    intro:
      "The vanilla entry exposes createDateTimePicker and createDateTimeRangePicker for imperative mounting in any bundler or Vite app. The site home page uses this API for every live example: inline calendars, popover inputs, locales, and dark theme, without loading React.",
    install: "npm install universal-datetime-picker",
    demoKind: "vanilla-mount",
    snippets: [
      {
        title: "ESM mount",
        code: `import { createDateTimePicker } from "universal-datetime-picker/vanilla";
import "universal-datetime-picker/style.css";

const root = document.getElementById("picker");
createDateTimePicker(root, {
  inline: true,
  mode: "date",
  asString: false,
  onChange: (value) => console.log(value),
});`,
      },
    ],
    notes: [
      "The home page at / uses this same vanilla API for all live examples.",
      "Handles returned from createDateTimePicker support update() and destroy().",
    ],
  },
  {
    slug: "web-components",
    label: "Web Components",
    tagline: "defineCustomElements from universal-datetime-picker/wc.",
    pageTitle: "Universal DateTime Picker — Web Components",
    pageDescription:
      "Live demo of datetime-picker, datetime-picker-input, and datetime-picker-range custom elements via defineCustomElements.",
    pageKeywords:
      "web component date picker, custom element date picker, framework agnostic date picker",
    intro:
      "The wc entry defines standard custom elements you can use from any stack or micro-frontend. Register with defineCustomElements(), listen for bubbling change events, and style with the shared stylesheet. Ideal when you want one calendar implementation across multiple frameworks on the same page.",
    install: "npm install universal-datetime-picker",
    demoKind: "wc",
    snippets: [
      {
        title: "Register and use",
        code: `import { defineCustomElements } from "universal-datetime-picker/wc";
import "universal-datetime-picker/style.css";

defineCustomElements();

const el = document.querySelector("datetime-picker");
el?.addEventListener("change", (e) => console.log((e as CustomEvent).detail));`,
      },
      {
        title: "HTML",
        code: `<datetime-picker inline mode="datetime" as-string="false"></datetime-picker>
<datetime-picker-input placeholder="Pick a date"></datetime-picker-input>
<datetime-picker-range inline as-string="false"></datetime-picker-range>`,
      },
    ],
    notes: [
      "Tags: datetime-picker, datetime-picker-input, datetime-picker-range.",
      "change and openchange events bubble and are composed.",
    ],
  },
  {
    slug: "cdn",
    label: "CDN",
    tagline: "jsDelivr IIFE + stylesheet, no bundler.",
    pageTitle: "Universal DateTime Picker — CDN (No Bundler)",
    pageDescription:
      "Load the picker from jsDelivr in plain HTML—no npm or bundler. Live custom-element demo with stylesheet and IIFE script.",
    pageKeywords: "cdn date picker, jsdelivr date picker, html date time picker",
    intro:
      "Add the jsDelivr stylesheet and IIFE script to any static HTML page. No npm or bundler required. Custom elements register automatically; attach change listeners for values. Pin a package version in production URLs for reproducible deploys.",
    install: "npm install universal-datetime-picker",
    demoKind: "cdn",
    snippets: [
      {
        title: "Plain HTML",
        code: `<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/universal-datetime-picker/dist/style.css" />
<script src="https://cdn.jsdelivr.net/npm/universal-datetime-picker"></script>

<datetime-picker inline mode="date" as-string="false"></datetime-picker>
<script>
  document.querySelector("datetime-picker")
    .addEventListener("change", (e) => console.log(e.detail));
</script>`,
      },
    ],
    notes: [
      "The IIFE bundle registers custom elements and can inject the default stylesheet link.",
      "Pin a version in production, e.g. …/universal-datetime-picker@2.0.0/dist/style.css and …/dist/cdn/universal-datetime-picker.iife.js",
    ],
  },
  {
    slug: "solid",
    label: "Solid",
    tagline: "Custom elements with Solid signals and onchange.",
    pageTitle: "Universal DateTime Picker — Solid (Web Components)",
    pageDescription:
      "SolidJS live demo using datetime-picker Web Components from ./wc. No ./solid export—register once and bind signals.",
    pageKeywords: "solidjs date picker, solid date time picker, web component date picker",
    intro:
      "SolidJS has no dedicated package subpath. Import defineCustomElements from universal-datetime-picker/wc in your client entry, then render datetime-picker tags with onchange handlers and signals. Keep registration and rendering client-side only; custom element classes cannot run during SSR.",
    install: "npm install universal-datetime-picker",
    demoKind: "solid",
    snippets: [
      {
        title: "Solid component",
        code: `/** @jsxImportSource solid-js */
import { createSignal } from "solid-js";
import { defineCustomElements } from "universal-datetime-picker/wc";
import "universal-datetime-picker/style.css";

// Call once in index.tsx before render:
defineCustomElements();

export function App() {
  const [date, setDate] = createSignal<Date | null>(null);

  return (
    <>
      <datetime-picker
        inline
        mode="date"
        as-string="false"
        onchange={(e: Event) => {
          const next = (e as CustomEvent).detail;
          setDate(next instanceof Date ? next : null);
        }}
      />
      <p>Selected: {date()?.toString() ?? "null"}</p>
    </>
  );
}`,
      },
    ],
    notes: [
      "Import defineCustomElements from ./wc (Solid has no dedicated subpath).",
      "Register in client entry (index.tsx) once, not inside components that re-run.",
      "Use client-side only; custom element classes cannot run during SSR.",
    ],
  },
  {
    slug: "preact",
    label: "Preact",
    tagline: "Custom elements with Preact props and onChange.",
    pageTitle: "Universal DateTime Picker — Preact (Web Components)",
    pageDescription:
      "Preact live demo with datetime-picker Web Components from ./wc, or use preact/compat with the React entry.",
    pageKeywords: "preact date picker, preact date time picker, web component date picker",
    intro:
      "Preact apps register Web Components from ./wc and render datetime-picker tags with onchange props. For a React-like API instead, you can use preact/compat with the main React component entry. This page focuses on the custom-element path that matches other non-React stacks.",
    install: "npm install universal-datetime-picker",
    demoKind: "preact",
    snippets: [
      {
        title: "Preact component",
        code: `import { useState } from "preact/hooks";
import { defineCustomElements } from "universal-datetime-picker/wc";
import "universal-datetime-picker/style.css";

// Call once in main.tsx before render:
defineCustomElements();

export function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <>
      <datetime-picker
        inline
        mode="date"
        as-string="false"
        onchange={(e: Event) => {
          const next = (e as CustomEvent).detail;
          setDate(next instanceof Date ? next : null);
        }}
      />
      <p>Selected: {date ? date.toString() : "null"}</p>
    </>
  );
}`,
      },
    ],
    notes: [
      "Register custom elements once in main.tsx; Preact renders the tags client-side.",
      "For a React-like API instead, use preact/compat with the main React component entry.",
    ],
  },
  {
    slug: "nextjs",
    label: "Next.js",
    tagline: "React components in a client boundary.",
    pageTitle: "Universal DateTime Picker — Next.js App Router",
    pageDescription:
      "Use DateTime and DateTimeInput in the Next.js App Router with a \"use client\" boundary and CSS import. Live React demo.",
    pageKeywords: "nextjs date picker, next.js date time picker, app router date picker",
    intro:
      "Next.js App Router requires a client boundary for interactive pickers. Mark components with \"use client\", import DateTime or DateTimeInput from universal-datetime-picker, and load style.css in that client file or a client layout. Server Components should not import the picker directly. Wrap usage in a client child as shown below.",
    install: "npm install universal-datetime-picker",
    demoKind: "react",
    snippets: [
      {
        title: "app/booking/DatePicker.tsx",
        code: `"use client";

import { useState } from "react";
import { DateTimeInput } from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

export function BookingDatePicker() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DateTimeInput
      asString={false}
      value={value}
      onChange={(next) => setValue(next instanceof Date ? next : null)}
    />
  );
}`,
      },
    ],
    notes: [
      "The live demo below uses the same React components as /react.",
      "Import style.css once in a client component or root layout.",
    ],
  },
  {
    slug: "nuxt",
    label: "Nuxt",
    tagline: "Vue + custom elements in a client-only island.",
    pageTitle: "Universal DateTime Picker — Nuxt 3 Integration",
    pageDescription:
      "Nuxt 3 live demo pattern: register datetime-picker in a .client plugin and render inside ClientOnly to avoid SSR issues.",
    pageKeywords: "nuxt date picker, nuxt 3 date time picker, vue nuxt datetime picker",
    intro:
      "Nuxt 3 should register custom elements in a .client plugin and render datetime-picker tags inside ClientOnly to avoid SSR errors. This differs from a plain Vue SPA: hydration and server render never touch HTMLElement-based definitions. The snippets below show the recommended plugin + ClientOnly pattern.",
    install: "npm install universal-datetime-picker",
    demoKind: "vue",
    snippets: [
      {
        title: "plugins/datetime-picker.client.ts",
        code: `import { defineCustomElements } from "universal-datetime-picker/vue";
import "universal-datetime-picker/style.css";

export default defineNuxtPlugin(() => {
  defineCustomElements();
});`,
      },
      {
        title: "Component",
        code: `<script setup lang="ts">
const date = ref<Date | null>(null);
function onChange(e: CustomEvent) {
  date.value = e.detail instanceof Date ? e.detail : null;
}
</script>

<template>
  <ClientOnly>
    <datetime-picker inline mode="date" as-string="false" @change="onChange" />
  </ClientOnly>
</template>`,
      },
    ],
    notes: [
      "The live demo below matches /vue (same Vue island); wrap tags in ClientOnly in a real Nuxt app to avoid SSR.",
      "Use a .client plugin to register elements once.",
    ],
  },
];

/** Short copy for home-page framework cards (not technical taglines). */
export const FRAMEWORK_CARD_SUMMARY: Record<FrameworkSlug, string> = {
  react: "Native DateTime, Input, and Range components.",
  vue: "Register custom elements once, use in Vue 3 templates.",
  svelte: "Custom elements with familiar Svelte event bindings.",
  angular: "Use datetime-picker tags in Angular templates.",
  vanilla: "Mount pickers with createDateTimePicker. No framework.",
  "web-components": "datetime-picker tags in any HTML or app.",
  cdn: "Drop in jsDelivr CSS + script; no build step.",
  solid: "Web Components with Solid signals (no ./solid export).",
  preact: "Web Components in Preact (no ./preact export).",
  nextjs: "Client components in the App Router.",
  nuxt: "Client-only islands and a Nuxt plugin.",
};

export const FRAMEWORK_BY_SLUG = Object.fromEntries(
  FRAMEWORKS.map((f) => [f.slug, f])
) as Record<FrameworkSlug, FrameworkDef>;

export const HOME_SNIPPET_TABS: { id: FrameworkSlug | "vanilla-tab"; label: string; slug: FrameworkSlug }[] = [
  { id: "react", label: "React", slug: "react" },
  { id: "vanilla-tab", label: "Vanilla", slug: "vanilla" },
  { id: "cdn", label: "CDN", slug: "cdn" },
  { id: "vue", label: "Vue", slug: "vue" },
  { id: "svelte", label: "Svelte", slug: "svelte" },
  { id: "angular", label: "Angular", slug: "angular" },
];

export const HOME_SNIPPETS: Record<string, string> = {
  react: `import { useState } from "react";
import { DateTimeInput } from "universal-datetime-picker";
import "universal-datetime-picker/style.css";

function App() {
  const [value, setValue] = useState<Date | null>(null);
  return (
    <DateTimeInput
      asString={false}
      value={value}
      onChange={(next) => setValue(next instanceof Date ? next : null)}
    />
  );
}`,
  "vanilla-tab": `import { createDateTimePicker } from "universal-datetime-picker/vanilla";
import "universal-datetime-picker/style.css";

createDateTimePicker(document.getElementById("picker"), {
  inline: true,
  mode: "date",
  asString: false,
  onChange: console.log,
});`,
  cdn: `<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/universal-datetime-picker/dist/style.css" />
<script src="https://cdn.jsdelivr.net/npm/universal-datetime-picker"></script>
<datetime-picker inline mode="date" as-string="false"></datetime-picker>`,
  vue: `// main.ts: register once
import { defineCustomElements } from "universal-datetime-picker/vue";
import "universal-datetime-picker/style.css";
defineCustomElements();
// app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith("datetime-picker")

// App.vue: <datetime-picker inline mode="date" as-string="false" @change="onChange" />`,
  svelte: `// src/routes/+layout.ts: register once
import { defineCustomElements } from "universal-datetime-picker/svelte";
import "universal-datetime-picker/style.css";
defineCustomElements();

// +page.svelte
// <datetime-picker inline mode="date" as-string="false" onchange={onChange} />
// event.detail is the selected Date (when as-string="false")`,
  angular: `// main.ts
import { registerDateTimePickerElements } from "universal-datetime-picker/angular";
import "universal-datetime-picker/style.css";
registerDateTimePickerElements();

// Standalone component: schemas: [CUSTOM_ELEMENTS_SCHEMA]
// <datetime-picker inline mode="date" as-string="false" (change)="onChange($event.detail)"></datetime-picker>`,
};
