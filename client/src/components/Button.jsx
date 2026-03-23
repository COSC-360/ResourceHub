export default function Button({ children, onClick, active, className, style }) {
    return (
        <button
            onClick={onClick}
            className={active ? "active" : className}
            style={{
                cursor: "pointer",
                pointerEvents: "auto",
                userSelect: "none",
                ...style,
            }}
        >
            {children}
        </button>
    );
}