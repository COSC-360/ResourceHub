import Header from '../Header/Header';
import './NotFound.css';
import { Link } from 'react-router-dom';
import { HOMEROUTE } from '../../constants/RouteConstants.jsx';

export default function NotFound() {
    return (
        <>
            <Header />
            <div className="not-found-container">
                <h1 className="not-found-title">404 - Page Not Found</h1>
                <p className="not-found-message">Sorry, the page you are looking for does not exist.</p>
                <Link to={HOMEROUTE} className="not-found-link">Go to Home</Link>
            </div>
        </>
    );
}