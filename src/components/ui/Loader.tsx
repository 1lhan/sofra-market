export const Loader = ({ type }: { type: "spinner" | "progress-bar" }) => {
    return (
        <div
            className={`loader-${type}`}
            role="status"
            aria-label="loading"
            aria-live="polite"
        />
    )
}