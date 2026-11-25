export function getMockImage(index: number, aspectRatio: number = 0.8): string {
  if (process.env.NEXT_PUBLIC_MOCK_IMAGES === "local") {
    const num = String((Math.abs(index) % 40) + 1).padStart(2, "0");
    return `/mock/outfits/${num}.jpg`;
  }

  // Tasteful SVG placeholders generated deterministically in brand colors
  const width = 600;
  const height = Math.round(width / (aspectRatio || 0.8));

  const palettes = [
    { start: "#161811", mid: "#24291E", end: "#2E3526", accent: "#9CA763", angle: "135" },
    { start: "#24291E", mid: "#3B4426", end: "#161811", accent: "#B5C17F", angle: "120" },
    { start: "#2E3526", mid: "#24291E", end: "#4A5432", accent: "#F1E8C7", angle: "150" },
    { start: "#1D2017", mid: "#2E3526", end: "#24291E", accent: "#9CA763", angle: "160" },
    { start: "#303627", mid: "#24291E", end: "#161811", accent: "#FAF5E4", angle: "135" },
    { start: "#24291E", mid: "#465030", end: "#1D2017", accent: "#B5C17F", angle: "140" },
  ];

  const p = palettes[Math.abs(index) % palettes.length];
  const silhouetteType = Math.abs(index) % 3; // 0 = hanger + coat, 1 = structured minimalist jacket, 2 = streetwear tee

  let silhouetteSvg = "";
  if (silhouetteType === 0) {
    // Hanger + clean drape
    silhouetteSvg = `
      <g stroke="${p.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.32">
        <path d="M ${width / 2} ${height * 0.32} C ${width / 2 + 16} ${height * 0.28}, ${width / 2 + 16} ${height * 0.24}, ${width / 2} ${height * 0.24} C ${width / 2 - 16} ${height * 0.24}, ${width / 2 - 16} ${height * 0.28}, ${width / 2} ${height * 0.32}" />
        <path d="M ${width / 2} ${height * 0.32} L ${width * 0.28} ${height * 0.44} L ${width * 0.72} ${height * 0.44} Z" />
        <path d="M ${width * 0.32} ${height * 0.44} L ${width * 0.28} ${height * 0.78} Q ${width / 2} ${height * 0.82} ${width * 0.72} ${height * 0.78} L ${width * 0.68} ${height * 0.44}" />
        <line x1="${width / 2}" y1="${height * 0.44}" x2="${width / 2}" y2="${height * 0.76}" stroke-dasharray="4 6" opacity="0.4" />
      </g>
    `;
  } else if (silhouetteType === 1) {
    // Minimalist tailored silhouette
    silhouetteSvg = `
      <g stroke="${p.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.32">
        <path d="M ${width * 0.36} ${height * 0.32} L ${width * 0.64} ${height * 0.32} L ${width * 0.78} ${height * 0.42} L ${width * 0.7} ${height * 0.78} L ${width * 0.3} ${height * 0.78} L ${width * 0.22} ${height * 0.42} Z" />
        <path d="M ${width * 0.42} ${height * 0.32} L ${width / 2} ${height * 0.52} L ${width * 0.58} ${height * 0.32}" />
        <line x1="${width / 2}" y1="${height * 0.52}" x2="${width / 2}" y2="${height * 0.76}" opacity="0.5" />
      </g>
    `;
  } else {
    // Streetwear drape
    silhouetteSvg = `
      <g stroke="${p.accent}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.32">
        <path d="M ${width * 0.32} ${height * 0.34} L ${width * 0.68} ${height * 0.34} L ${width * 0.82} ${height * 0.44} L ${width * 0.74} ${height * 0.52} L ${width * 0.68} ${height * 0.48} L ${width * 0.68} ${height * 0.78} L ${width * 0.32} ${height * 0.78} L ${width * 0.32} ${height * 0.48} L ${width * 0.26} ${height * 0.52} L ${width * 0.18} ${height * 0.44} Z" />
        <path d="M ${width * 0.42} ${height * 0.34} Q ${width / 2} ${height * 0.40} ${width * 0.58} ${height * 0.34}" />
      </g>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="grad-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.start}"/>
          <stop offset="50%" stop-color="${p.mid}"/>
          <stop offset="100%" stop-color="${p.end}"/>
        </linearGradient>
        <radialGradient id="glow-${index}" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad-${index})"/>
      <rect width="${width}" height="${height}" fill="url(#glow-${index})"/>
      ${silhouetteSvg}
      <circle cx="${width / 2}" cy="${height / 2}" r="${width * 0.28}" stroke="${p.accent}" stroke-width="1" stroke-dasharray="2 8" opacity="0.15" fill="none"/>
    </svg>
  `.replace(/\s+/g, " ").trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
