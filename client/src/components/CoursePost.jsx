function CoursePost({ course }) {
    let courseName = course.name + " " + course.code;
    let courseDescription = course.description;
    let numberOfStudents = course.numberOfStudents;

    return (
        <div>
            <h1>{courseName}</h1>
            <p>{courseDescription}</p>
            <p>Number of Students: {numberOfStudents}</p>
        </div>
    )
}