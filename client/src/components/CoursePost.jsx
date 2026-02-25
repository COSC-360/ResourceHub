function CoursePost({ course }) {
    let courseName = course.name + " " + course.code;
    let courseDescription = course.description;
    let courseImage = course.image;
    let numberOfStudents = course.numberOfStudents;

    return (
        <article className="course-post">
            <header>
                <div>
                    <h3>{courseName}</h3>
                    <p>{courseDescription}</p>
                </div>
                <button>⋮</button>
            </header>
            
            <img src={courseImage} alt={`${courseName} course image`} />
            <img /><p>Number of Students: {numberOfStudents}</p> // img icon is three people thingy
        </article>
    )
}

export default CoursePost;