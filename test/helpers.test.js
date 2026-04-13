import { describe, it, expect, vi } from "vitest";

import {
  SUPPORTED_LICENSES,
  assertSupportedLicense,
  getWCClassName,
  replacePackageVersion,
} from "../generators/app/helpers.js";

describe("getWCClassName", () => {
  it("converts a single-word tag to PascalCase", () => {
    expect(getWCClassName("foo")).toBe("Foo");
  });

  it("converts dash-separated tag names to PascalCase", () => {
    expect(getWCClassName("my-fancy-wc")).toBe("MyFancyWc");
  });

  it("handles leading, trailing and double dashes gracefully", () => {
    expect(getWCClassName("-foo--bar-")).toBe("FooBar");
  });

  it("returns an empty string for empty input", () => {
    expect(getWCClassName("")).toBe("");
  });

  it("returns an empty string for non-string input", () => {
    expect(getWCClassName(undefined)).toBe("");
    expect(getWCClassName(null)).toBe("");
  });
});

describe("replacePackageVersion", () => {
  it("updates every dependency using the injected fetcher", () => {
    const deps = {
      lit: "^2.0.0",
      chalk: "^5.0.0",
    };
    const fetcher = vi.fn((name) => {
      if (name === "lit") return "3.1.2";
      if (name === "chalk") return "5.3.0";
      throw new Error(`unexpected call for ${name}`);
    });

    const result = replacePackageVersion(deps, fetcher);

    expect(result).toBe(deps);
    expect(deps).toEqual({
      lit: "^3.1.2",
      chalk: "^5.3.0",
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith("lit");
    expect(fetcher).toHaveBeenCalledWith("chalk");
  });

  it("trims whitespace and newlines from the fetched version", () => {
    const deps = { lit: "^2.0.0" };
    replacePackageVersion(deps, () => "3.1.2\n");
    expect(deps.lit).toBe("^3.1.2");
  });

  it("is a no-op when the map is missing", () => {
    const fetcher = vi.fn();
    expect(replacePackageVersion(undefined, fetcher)).toBeUndefined();
    expect(replacePackageVersion(null, fetcher)).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("throws when the fetcher is not a function", () => {
    expect(() => replacePackageVersion({ lit: "^2.0.0" }, null)).toThrow(
      TypeError,
    );
  });

  it("throws when the fetcher returns an invalid version", () => {
    expect(() => replacePackageVersion({ lit: "^2.0.0" }, () => "")).toThrow(
      /Invalid version.*lit/,
    );
    expect(() =>
      replacePackageVersion({ lit: "^2.0.0" }, () => undefined),
    ).toThrow(/Invalid version.*lit/);
  });

  it("propagates errors raised by the fetcher", () => {
    const boom = new Error("npm view exploded");
    expect(() =>
      replacePackageVersion({ lit: "^2.0.0" }, () => {
        throw boom;
      }),
    ).toThrow(boom);
  });
});

describe("assertSupportedLicense", () => {
  it("exposes the frozen allow-list", () => {
    expect(SUPPORTED_LICENSES).toEqual(["MIT", "Apache-2.0", "ISC", "GPL-3.0"]);
    expect(Object.isFrozen(SUPPORTED_LICENSES)).toBe(true);
  });

  it.each(SUPPORTED_LICENSES)("accepts the supported license %s", (license) => {
    expect(assertSupportedLicense(license)).toBe(license);
  });

  it("rejects unknown licenses", () => {
    expect(() => assertSupportedLicense("BSD")).toThrow(/Unsupported license/);
  });

  it("rejects path traversal attempts", () => {
    expect(() => assertSupportedLicense("../../etc/passwd")).toThrow(
      /Unsupported license/,
    );
  });

  it("is case sensitive against the SPDX canonical form", () => {
    expect(() => assertSupportedLicense("mit")).toThrow(/Unsupported license/);
    expect(() => assertSupportedLicense("APACHE-2.0")).toThrow(
      /Unsupported license/,
    );
  });

  it("rejects non-string input", () => {
    expect(() => assertSupportedLicense(undefined)).toThrow(
      /Unsupported license/,
    );
    expect(() => assertSupportedLicense(null)).toThrow(/Unsupported license/);
  });
});
