export function search(searchTerm){
    const data = require('../data/temp.json');
    const courses = data.courses;
    const results = [];
    for(let i = 0; i < courses.length; i++){
        if(courses[i].includes(searchTerm)){
            results.push(courses[i]);
        }
    }
    return results;
}