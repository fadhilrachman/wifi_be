import fs from "fs";
import path from "path";
import YAML from "yaml";

type AnyRecord = Record<string, any>;

const baseSpec: AnyRecord = {
  openapi: "3.0.0",
  info: {
    title: "INCIT API",
    version: "1.0.0",
    description: "API documentation for INCIT backend",
  },
  servers: [{ url: "http://localhost:5000" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [],
  paths: {},
};

// Try to locate docs both in source (dev) and bundled (serverless) layouts
const DOC_DIR_CANDIDATES = [
  path.join(__dirname, "docs"),
  path.resolve(process.cwd(), "src", "docs"),
];

function loadYamlFiles(dir: string): AnyRecord[] {
  try {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const out: AnyRecord[] = [];
    for (const f of files) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        out.push(...loadYamlFiles(full));
      } else if (f.isFile() && (f.name.endsWith(".yaml") || f.name.endsWith(".yml"))) {
        try {
          const raw = fs.readFileSync(full, "utf8");
          const parsed = YAML.parse(raw) as AnyRecord;
          if (parsed) out.push(parsed);
        } catch (e) {
          console.warn("Failed to parse YAML:", full, e);
        }
      }
    }
    return out;
  } catch (e) {
    console.warn("Failed to read docs dir:", dir, e);
    return [];
  }
}

function mergeSpec(target: AnyRecord, source: AnyRecord) {
  if (source.paths) {
    target.paths = target.paths || {};
    for (const [p, val] of Object.entries(source.paths)) {
      target.paths[p] = { ...(target.paths[p] || {}), ...(val as AnyRecord) };
    }
  }
  if (source.tags) {
    const accum = (target.tags || []) as Array<AnyRecord>;
    const existing = new Set(accum.map((t) => t.name || t));
    for (const t of source.tags as Array<any>) {
      const name = typeof t === "string" ? t : t.name;
      if (!existing.has(name)) {
        accum.push(t);
        existing.add(name);
      }
    }
    target.tags = accum;
  }
  if (source.components) {
    target.components = target.components || {};
    for (const [k, v] of Object.entries(source.components)) {
      target.components[k] = { ...(target.components[k] || {}), ...(v as AnyRecord) };
    }
  }
}

let fragments: AnyRecord[] = [];
for (const d of DOC_DIR_CANDIDATES) {
  const parts = loadYamlFiles(d);
  if (parts.length) {
    fragments = parts;
    break;
  }
}
for (const frag of fragments) mergeSpec(baseSpec, frag);

export const swaggerSpec = baseSpec;

// Small helper for debugging: counts of merged items
export const swaggerDebug = {
  pathCount: Object.keys(baseSpec.paths || {}).length,
  tagsCount: (baseSpec.tags || []).length,
};
