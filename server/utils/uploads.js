import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "..", "uploads");

export function resolveLocalUploadPath(rawPath) {
  if (typeof rawPath !== "string") return null;
  const value = rawPath.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return null;

  const normalized = value.replace(/^\/+/, "");
  if (!normalized.startsWith("uploads/")) return null;

  const relativeUploadPath = normalized.slice("uploads/".length);
  const absolutePath = path.resolve(uploadsDir, relativeUploadPath);
  const relativeToUploads = path.relative(uploadsDir, absolutePath);
  if (
    !relativeToUploads ||
    relativeToUploads === ".." ||
    relativeToUploads.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeToUploads)
  ) {
    return null;
  }

  return absolutePath;
}