export default function PixelLoader({ label = "loading" }) {
    return (
        <div className="pixel-loader">
            <span className="pixel-loader-dots" aria-hidden="true">
                <i />
                <i />
                <i />
            </span>
            <p>{label}&hellip;</p>
        </div>
    );
}
