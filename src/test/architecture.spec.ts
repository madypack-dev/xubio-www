import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const MODULES_ROOT = join(process.cwd(), "src/modules");

function collectSourceFiles(rootDir: string): string[] {
  const entries = readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (entry.isFile() && (fullPath.endsWith(".ts") || fullPath.endsWith(".vue"))) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractImportSpecifiers(sourceCode: string): string[] {
  const matches = sourceCode.matchAll(
    /(?:import|export)\s+[\s\S]*?\sfrom\s+["']([^"']+)["']/g
  );
  return Array.from(matches, (match) => match[1]);
}

function hasLayerInSpecifier(specifier: string, layer: string): boolean {
  const pattern = new RegExp(`(^|[\\\\/])${layer}([\\\\/]|$)`);
  return pattern.test(specifier);
}

describe("module architecture boundaries", () => {
  it("keeps domain independent from outer layers", () => {
    const files = collectSourceFiles(MODULES_ROOT).filter((path) =>
      /[\\/]domain[\\/]/.test(path)
    );
    const violations: string[] = [];

    for (const file of files) {
      const sourceCode = readFileSync(file, "utf8");
      const imports = extractImportSpecifiers(sourceCode);
      for (const specifier of imports) {
        if (
          hasLayerInSpecifier(specifier, "application") ||
          hasLayerInSpecifier(specifier, "infrastructure") ||
          hasLayerInSpecifier(specifier, "presentation")
        ) {
          violations.push(`${file} -> ${specifier}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps application independent from infrastructure", () => {
    const files = collectSourceFiles(MODULES_ROOT).filter((path) =>
      /[\\/]application[\\/]/.test(path)
    );
    const violations: string[] = [];

    for (const file of files) {
      const sourceCode = readFileSync(file, "utf8");
      const imports = extractImportSpecifiers(sourceCode);
      for (const specifier of imports) {
        if (hasLayerInSpecifier(specifier, "infrastructure")) {
          violations.push(`${file} -> ${specifier}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
