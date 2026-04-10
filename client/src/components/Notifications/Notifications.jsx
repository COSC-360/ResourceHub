import { useContext, useEffect, useState } from "react";
import AuthContext from "../../AuthContext.jsx";
import "./Notifications.css";

export function Notifications() {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const token = user?.access_token;
        if (!token) return;

        const fetchNotifications = async () => {
            try {
                const since =
                    localStorage.getItem("lastNotificationCheck") ||
                    new Date(0).toISOString();

                const response = await fetch(
                    `http://localhost:3000/api/notifications?since=${encodeURIComponent(since)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) return;

                const data = await response.json();

                setNotifications(data.items || []);
                setNotificationCount(data.count || 0);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();
    }, [user?.access_token]);

    const handleNotificationClick = () => {
        const opening = !showNotifications;
        setShowNotifications(opening);

        if (opening) {
            localStorage.setItem(
                "lastNotificationCheck",
                new Date().toISOString()
            );
            setNotificationCount(0);
        }
    };

    return (
        <div className="notificationWrapper">
            <button
                className="notificationButton"
                onClick={handleNotificationClick}
            >
                🔔
                {notificationCount > 0 && (
                    <span className="notificationBadge">
                        {notificationCount}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="notificationDropdown">
                    {notifications.length === 0 ? (
                        <p>No new notifications</p>
                    ) : (
                        notifications.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="notificationItem"
                            >
                                <p>{item.text}</p>
                                <small>
                                    {new Date(item.createdAt).toLocaleString()}
                                </small>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Notifications;