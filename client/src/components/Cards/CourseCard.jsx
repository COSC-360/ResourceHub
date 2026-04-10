import { Link } from 'react-router-dom';
import { DEFAULT_COURSE_COVER, resolveCourseImageSrc } from '../../lib/course-cover.js';
import MemberCount from '../MemberCount/MemberCount.jsx';
import './CourseCard.css';
import { coursePath } from '../../constants/RouteConstants.jsx';

export default function CourseCard({ data }) {
    if (!data) return null;

    const id = data._id || data.id;
    const name = data.name || data.coursename || 'Untitled Course';
    const code = data.code || data.coursecode || '';
    const description = data.description || 'No description yet.';
    const imageSrc = resolveCourseImageSrc(data.image);
    const memberCount = Number(data.memberCount ?? data.numberOfStudents ?? 0);

    return (
        <Link
            to={coursePath(id)}
            state={{ course: data }}
            className="course-card"
        >
            <div className="course-card__image-wrap">
                {imageSrc ? (
                    <img
                        className="course-card__image"
                        src={imageSrc}
                        alt={`${name} cover`}
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = DEFAULT_COURSE_COVER;
                        }}
                    />
                ) : (
                    <img className="course-card__image" src={DEFAULT_COURSE_COVER} alt="" />
                )}
            </div>

            <div className="course-card__content">
                <h3 className="course-card__title">
                    {name} {code ? `(${code})` : ''}
                </h3>
                <p className="course-card__description">{description}</p>
                <MemberCount count={memberCount} className="course-card__meta" />
            </div>
        </Link>
    );
}