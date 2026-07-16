import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("ships a persistent Chinese and English interface switch", async () => {
  const [i18n, shell, home, courses] = await Promise.all([
    readSource("app/components/I18n.tsx"),
    readSource("app/components/AppShell.tsx"),
    readSource("app/components/HomePageView.tsx"),
    readSource("app/components/CoursePageViews.tsx"),
  ]);

  assert.match(i18n, /prompt-ui-locale/);
  assert.match(i18n, /document\.documentElement\.lang/);
  assert.match(shell, /Switch to Chinese/);
  assert.match(home, /View learning path/);
  assert.match(courses, /UI Visual Dictionary|Open the UI dictionary/);
});

test("keeps modal background placeholders behind the scrim and dialog", async () => {
  const css = await readSource("app/globals.css");

  assert.match(css, /mini-screen::before,.mini-screen::after[^}]*z-index:0/);
  assert.match(css, /mini-scrim[^}]*z-index:1/);
  assert.match(css, /mini-modal[^}]*z-index:2/);
});

test("uses the public maintainer identity in the license", async () => {
  const license = await readSource("LICENSE");
  assert.match(license, /Copyright \(c\) 2026 PeterShanxin/);
});
