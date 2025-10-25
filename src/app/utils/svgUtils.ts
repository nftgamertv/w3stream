export const createSVGCanvas = (svg: SVGSVGElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Match canvas size to SVG size
  const rect = svg.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Convert SVG to data URL
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // Draw SVG to canvas
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
    URL.revokeObjectURL(url);
  };
  img.src = url;

  return canvas;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};