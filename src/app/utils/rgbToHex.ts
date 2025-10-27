export const rgbToHex = (rgb: string): string => {
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000'; // Default to black if invalid
    const [r, g, b] = result.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };
  