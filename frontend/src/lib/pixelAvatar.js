// Generates a deterministic little pixel "chick blob" avatar from a string
// (the username). Same input always produces the same avatar, so every
// bokbok user gets a unique identity without needing to upload a photo.

const PALETTE = [
    ["#E8543A", "#241608"], // comb red / ink
    ["#FFC53D", "#4A2E1E"], // beak yellow / brown
    ["#7EC8E3", "#241608"], // sky blue / ink
    ["#5B8C3A", "#241608"], // grass green / ink
    ["#B968C7", "#241608"], // plum / ink
    ["#4A2E1E", "#FFC53D"], // brown / yellow
];

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// Returns an SVG markup string for a 5x5 symmetric pixel avatar
export function generatePixelAvatarSVG(seedString, size = 40) {
    const seed = hashString(seedString || "bok");
    const [fg, bg] = PALETTE[seed % PALETTE.length];
    const cell = 5;
    const cols = 5;
    const half = Math.ceil(cols / 2);

    let bits = seed;
    const grid = [];
    for (let row = 0; row < cols; row++) {
        const rowBits = [];
        for (let col = 0; col < half; col++) {
            bits = (bits * 1103515245 + 12345) & 0x7fffffff;
            rowBits.push(bits % 2 === 0);
        }
        const fullRow = [...rowBits, ...rowBits.slice(0, cols - half).reverse()];
        grid.push(fullRow);
    }

    let rects = `<rect width="${cell * cols}" height="${cell * cols}" fill="${bg}" />`;
    grid.forEach((row, r) => {
        row.forEach((on, c) => {
            if (on) {
                rects += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="${fg}" />`;
            }
        });
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cell * cols} ${cell * cols}" width="${size}" height="${size}" shape-rendering="crispEdges">${rects}</svg>`;
}

export function pixelAvatarDataUri(seedString, size = 40) {
    const svg = generatePixelAvatarSVG(seedString, size);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
