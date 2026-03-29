import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// this will all be unnecessary once we actually use a database
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '../data/temp.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

export function search(searchTerm){
    const courses = data.courses;
    const termLower = searchTerm.toLowerCase();
    const results = [];
    for(let i = 0; i < courses.length; i++){
        if(courses[i].toLowerCase().includes(termLower)){
            results.push(courses[i]);
        }
    }
    return results;
}