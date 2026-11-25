export default function NoChatSelected() {
    return (
        <div className="no-chat-selected">
            <div className="no-chat-egg" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 16 16" shapeRendering="crispEdges">
                    <rect x="2" y="2" width="12" height="1" fill="#241608" />
                    <rect x="1" y="3" width="1" height="7" fill="#241608" />
                    <rect x="14" y="3" width="1" height="7" fill="#241608" />
                    <rect x="2" y="3" width="12" height="7" fill="#FFC53D" />
                    <rect x="4" y="6" width="2" height="1" fill="#E8543A" />
                    <rect x="7" y="6" width="2" height="1" fill="#E8543A" />
                    <rect x="10" y="6" width="2" height="1" fill="#E8543A" />
                    <rect x="2" y="10" width="2" height="1" fill="#241608" />
                    <rect x="7" y="10" width="7" height="1" fill="#241608" />
                    <rect x="4" y="10" width="3" height="2" fill="#FFC53D" />
                    <rect x="3" y="11" width="1" height="2" fill="#241608" />
                    <rect x="6" y="11" width="1" height="1" fill="#241608" />
                    <rect x="4" y="12" width="2" height="1" fill="#241608" />
                </svg>
            </div>
            <h2>all quiet for now</h2>
            <p>pick a friend on the left, or search for one, to start talking.</p>
        </div>
    );
}
