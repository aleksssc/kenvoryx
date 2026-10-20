import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const file = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFile(file(path));

async function load(path, dependencies = {}) {
  const code = ts.transpileModule((await read(path)).toString(), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", code)(
    (name) => dependencies[name] ?? require(name),
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

const { BrandLogo } = await load("components/brand-logo.tsx", {
  "@/lib/utils": await load("lib/utils.ts"),
});
const renderLogo = (props) => renderToStaticMarkup(React.createElement(BrandLogo, props));

test("KenvoryX lockup has one new symbol and a single-line branded wordmark", () => {
  const html = renderLogo({ variant: "lockup" });
  assert.equal((html.match(/<img\\b/g) ?? []).length, 1);
  assert.match(html, /alt=""/);
  assert.match(html, /src="\\/logos\\/kenvoryx-mark\\.svg"/);
  assert.match(html, /Kenvory<span[^>]*>X<\\/span>/);
  assert.doesNotMatch(html, /SentinelGrid|sentinelgrid-mark/);
  assert.match(renderLogo({ variant: "lockup", decorative: true }), /^<span aria-hidden="true"/);
});

test("mark and wordmark preserve accessible naming and class overrides", () => {
  const mark = renderLogo({ className: "h-9 w-9" });
  assert.match(mark, /alt="KenvoryX"/);
  assert.match(mark, /width="350" height="365"/);
  assert.match(mark, /class="shrink-0 object-contain h-8 w-8 h-9 w-9"/);
  const wordmark = renderLogo({ variant: "wordmark" });
  assert.match(wordmark, /Kenvory<span[^>]*>X<\\/span>/);
  assert.match(renderLogo({ decorative: true }), /alt=""/);
});

test("all vector identity files have valid standalone SVG content", async () => {
  for (const name of ["kenvoryx-mark", "kenvoryx-wordmark", "kenvoryx-lockup"]) {
    const svg = await read(`public/logos/${name}.svg`);
    assert.match(svg.toString(), /<svg[^>]+viewBox=/);
    const metadata = await sharp(svg).metadata();
    assert.equal(metadata.format, "svg");
  }
  const icon = await read("app/icon.svg");
  assert.match(icon.toString(), /KenvoryX|kv-spine/);
});

test("generated social and Apple images use the KenvoryX brand", async () => {
  await import("./generate-kenvoryx-assets.mjs");
  const [social, apple] = await Promise.all([
    sharp(await read("public/og-image.png")).metadata(),
    sharp(await read("app/apple-icon.png")).metadata(),
  ]);
  assert.equal(social.width, 1200);
  assert.equal(social.height, 630);
  assert.equal(apple.width, 180);
  assert.equal(apple.height, 180);
  assert.match((await read("app/layout.tsx")).toString(), /KenvoryX/);
});

test("website, auth and dashboard use the shared logo component", async () => {
  for (const path of [
    "components/marketing/marketing-navigation.tsx",
    "app/auth/layout.tsx",
    "app/loading.tsx",
    "app/onboarding/page.tsx",
    "app/onboarding/onboarding-submit.tsx",
    "components/dashboard/dashboard-sidebar.tsx",
  ]) {
    const source = (await read(path)).toString();
    assert.match(source, /<BrandLogo\\b/, path);
  }
});
