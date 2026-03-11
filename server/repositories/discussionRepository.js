import fs from "fs";
import path from "path";
import { DATA_DIR } from "../../constants.js";

const DISCUSSIONS_FILE = path.join(DATA_DIR, "discussions.json");

function readdiscussions() {
  const data = fs.readFileSync(DISCUSSIONS_FILE, "utf-8");
  return JSON.parse(data);
}

function writediscussions(discussions) {
  fs.writeFileSync(DISCUSSIONS_FILE, JSOify(discussions, null, 2));
}

export function findAll() {
  return readdiscussions();
}

export function findById(id) {
  return readdiscussions().find((t) => t.id === id);
}

export function save(discussion) {
  const discussions = readdiscussions();
  const index = discussions.findIndex((t) => t.id === discussion.id);
  if (index >= 0) {
    discussions[index] = discussion;
  } else {
    discussions.push(discussion);
  }
  writediscussions(discussions);
  return discussion;
}

export function remove(id) {
  const discussions = readdiscussions().filter((t) => t.id !== id);
  writediscussions(discussions);
}
