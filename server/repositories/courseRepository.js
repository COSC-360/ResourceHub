import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COURSES_FILE = path.resolve(__dirname, '../data/courses.json');

function readCourses() {
    const data = fs.readFileSync(COURSES_FILE, 'utf8');
    return JSON.parse(data);
}

function writeCourses(courses) {
    fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2));
}

export function save(course) {
    const courses = readCourses();
    courses.push(course);
    writeCourses(courses);
    return course;
}
