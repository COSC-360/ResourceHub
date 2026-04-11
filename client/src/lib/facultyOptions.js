export const CUSTOM_FACULTY_VALUE = "__custom__";

export const FACULTY_OPTIONS = [
  "Mathematics",
  "English",
  "Computer Science",
  "Engineering",
  "Science",
  "Arts",
  "Business",
  "Health and Social Development",
  "Education",
  "Law",
  "Other",
];

export function facultySelectionFromValue(value) {
  const text = value == null ? "" : String(value).trim();
  const normalizedText = text.toLowerCase();
  const sentinelValues = new Set(["none", "n/a"]);
  if (!text || sentinelValues.has(normalizedText)) {
    return { selected: "", custom: "" };
  }
  if (FACULTY_OPTIONS.includes(text)) return { selected: text, custom: "" };
  return { selected: CUSTOM_FACULTY_VALUE, custom: text };
}

export function facultyValueFromSelection(selected, custom) {
  if (selected === CUSTOM_FACULTY_VALUE) {
    return String(custom ?? "").trim();
  }
  return String(selected ?? "").trim();
}
