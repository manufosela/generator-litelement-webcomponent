"use strict";

/**
 * Convert a dashed web-component name into PascalCase, used as the base
 * for the generated JavaScript class name (e.g. "my-fancy-wc" -> "MyFancyWc").
 *
 * @param {string} wcname Web component tag name (lowercase, dash-separated).
 * @returns {string} PascalCase class name.
 */
export function getWCClassName(wcname) {
  if (typeof wcname !== "string" || wcname.length === 0) {
    return "";
  }

  return wcname
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Update every dependency version in a `dependencies` / `devDependencies`
 * map to its latest resolved version, using the provided version fetcher.
 *
 * The fetcher is injected so this helper stays pure and testable without
 * shelling out to `npm view`.
 *
 * @param {Record<string, string> | undefined | null} depsMap
 *   The dependency map to mutate in place. No-op when null/undefined.
 * @param {(depName: string) => string} fetchLatestVersion
 *   Callback returning the latest version string for a given package.
 * @returns {Record<string, string> | undefined} The mutated map (same reference).
 */
export function replacePackageVersion(depsMap, fetchLatestVersion) {
  if (!depsMap) {
    return depsMap;
  }

  if (typeof fetchLatestVersion !== "function") {
    throw new TypeError("fetchLatestVersion must be a function");
  }

  for (const depName of Object.keys(depsMap)) {
    const latest = fetchLatestVersion(depName);
    if (typeof latest !== "string" || latest.length === 0) {
      throw new Error(`Invalid version returned for dependency "${depName}"`);
    }

    depsMap[depName] = `^${latest.trim()}`;
  }

  return depsMap;
}
