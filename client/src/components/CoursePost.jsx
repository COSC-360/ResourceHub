import './css/CoursePost.css';

function CoursePost({ course }) {
    let courseName = course.name + " " + course.code;
    let courseDescription = course.description;
    let courseImage = course.image;
    let numberOfStudents = course.numberOfStudents;

    return (
        <article className="course-post">
            <header>
                <div className="course-info">
                    <h3>{courseName}</h3>
                    <p>{courseDescription}</p>
                </div>
                <button className="menu-button"><img src="/src/assets/menu-icon.svg" alt="Menu icon" /></button>
            </header>
            
            <img className="course-image" src={courseImage} alt={`${courseName} course image`} />
            
            <footer>
                <p>
                    <img className="student-count-icon" src="/src/assets/student-count-icon.svg" alt="Student count icon" />
                    {numberOfStudents}
                </p> 
            </footer>
        </article>
    )
}

export default CoursePost;