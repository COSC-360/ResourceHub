import './CoursePost.css';
import menuIcon from "../../assets/menu-icon.svg";
import studentCountIcon from "../../assets/student-count-icon.svg";
import { DEFAULT_COURSE_COVER, resolveCourseImageSrc } from "../../lib/course-cover.js";

function CoursePost({ course }) {
    let courseName = course.name + " " + course.code;
    let courseDescription = course.description;
    let courseImage = resolveCourseImageSrc(course.image) || DEFAULT_COURSE_COVER;
    let numberOfStudents = course.numberOfStudents;

    return (
        <article className="course-post">
            <header>
                <div className="course-info">
                    <h3>{courseName}</h3>
                    <p>{courseDescription}</p>
                </div>
                <button className="menu-button"><img src={menuIcon} alt="Menu icon" /></button>
            </header>
            
            <img
                className="course-image"
                src={courseImage}
                alt={`${courseName} course image`}
                onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = DEFAULT_COURSE_COVER;
                }}
            />
            
            <footer>
                <p>
                    <img className="student-count-icon" src={studentCountIcon} alt="Student count icon" />
                    {numberOfStudents}
                </p> 
            </footer>
        </article>
    )
}

export default CoursePost;