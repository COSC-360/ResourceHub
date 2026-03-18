import { v4 as uuidv4 } from 'uuid';

export class Course {
    constructor(id, name, code, description, image) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.image = image;
    }

    static create(name, code, description, image = null) {
        return new Course(uuidv4(), name, code, description, image);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            code: this.code,
            description: this.description,
            image: this.image,
        };
    }
}