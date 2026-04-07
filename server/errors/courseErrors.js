export class CourseCodeAlreadyExistsError extends Error {
    constructor(code) {
        super(`Course with code "${code}" already exists`);
        this.name = "CourseCodeAlreadyExistsError";
    }
}