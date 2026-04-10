import mongoose from "mongoose";

export function parseCsv(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
          .filter(Boolean);
      }
    } catch {
      // fall through to CSV-style parsing
    }
  }

  return raw
    .split(/[\n,]/)
    .map((item) => item.trim())
    .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
    .filter(Boolean);
}

export function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes"].includes(normalized)) return true;
  if (["0", "false", "no"].includes(normalized)) return false;
  return undefined;
}

export function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export function hasInvalidObjectId(ids = []) {
  return ids.some((id) => !mongoose.Types.ObjectId.isValid(id));
}

export function parseSearchTypes(value, allowedTypes, defaultTypes = []) {
  const parsed = parseCsv(value).map((item) => item.toLowerCase());
  if (parsed.length === 0) return defaultTypes;

  const types = parsed.filter((type) => allowedTypes.has(type));
  if (types.length === 0) return null;
  return types;
}
