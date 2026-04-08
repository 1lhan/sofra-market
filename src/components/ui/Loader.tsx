"use client"

export default function Loader({ type }: { type: "spinner" | "progress-bar" | "bubble" }) {
    switch (type) {
        case "spinner":
            return <div className="loader-spinner" role="status" aria-label="loading" />
        case "progress-bar":
            return <div className="loader-progress-bar" role="status" aria-label="loading" />
        case "bubble":
            return (
                <div className="loader-bubble" role="status" aria-label="loading">
                    <div className="bubble" />
                    <div className="bubble" />
                    <div className="bubble" />
                </div>
            )
    }
}