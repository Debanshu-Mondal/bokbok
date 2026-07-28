import { pixelAvatarDataUri } from "../lib/pixelAvatar";

export default function PixelAvatar({ seed, src, size = 40, online = false, alt = "" }) {
    const imgSrc = src || pixelAvatarDataUri(seed, size);

    return (
        <span className="pixel-avatar" style={{ width: size, height: size }}>
            <img src={imgSrc} width={size} height={size} alt={alt} draggable={false} />
            {online && <span className="pixel-avatar-dot" title="online" />}
        </span>
    );
}
