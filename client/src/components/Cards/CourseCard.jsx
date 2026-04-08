import { Link } from 'react-router-dom';
import MemberCount from '../MemberCount/MemberCount.jsx';
import './CourseCard.css';

export default function CourseCard({ data }) {
    if (!data) return null;

    const id = data._id || data.id;
    const name = data.name || data.coursename || 'Untitled Course';
    const code = data.code || data.coursecode || '';
    const description = data.description || 'No description yet.';
    const image = data.image || '';
    const memberCount = Number(data.memberCount ?? data.numberOfStudents ?? 0);

    return (
        <Link
            to={`/courses/${id}`}
            state={{ course: data }}
            className="course-card"
        >
            <div className="course-card__image-wrap">
                {image ? (
                    <img className="course-card__image" src={image} alt={`${name} cover`} />
                ) : (
                    <div className="course-card__image course-card__image--placeholder">
                        No image
                    </div>
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