import './NotAuthorized.css';
import { Link } from 'react-router-dom';

export default function NotAuthorized() {
    return (
        <>
            <div className="not-authorized-container">
                <h1 className="not-authorized-title">403 - Not Authorized</h1>
                <p className="not-authorized-message">You are not authorized to access this route.</p>
                <Link to="/" className="not-authorized-link">Go to Home</Link>
            </div>
        </>
    );
}
