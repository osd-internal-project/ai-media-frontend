import { register } from "node:module";

// `node --test` needs explicit `.ts` paths, but the app imports without extensions
// (moduleResolution "bundler"). This hook appends `.ts` to extensionless relative imports.
export async function resolve(specifier, context, nextResolve) {
  if (/^\.{1,2}\//.test(specifier) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}

if (!process.env.VIDEO_EDITOR_TEST_RESOLVE) {
  process.env.VIDEO_EDITOR_TEST_RESOLVE = "1";
  register(import.meta.url);
}
