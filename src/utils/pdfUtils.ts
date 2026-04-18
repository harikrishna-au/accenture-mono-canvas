import * as pdfjsLib from 'pdfjs-dist';

// Use locally bundled worker (Vite copies it to dist) instead of CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type LineItem = { x: number; str: string; width: number; fontSize: number };

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const [content, viewport] = await Promise.all([
      page.getTextContent({ includeMarkedContent: false }),
      Promise.resolve(page.getViewport({ scale: 1 })),
    ]);

    const pageWidth = viewport.width;

    // ── 1. Bucket items into visual lines by y-coordinate.
    //       Use 4-unit buckets so minor baseline shifts don't fragment lines.
    const lineMap = new Map<number, LineItem[]>();

    for (const raw of content.items as any[]) {
      const str: string = raw.str ?? '';
      if (!str.trim()) continue;

      const y    = Math.round(raw.transform[5] / 4) * 4;
      const x    = raw.transform[4] as number;
      const w    = raw.width as number ?? 0;
      const size = Math.abs(raw.transform[0]) as number; // font size approx

      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({ x, str, width: w, fontSize: size });
    }

    // ── 2. Sort lines top-to-bottom (PDF y=0 is at bottom).
    const sortedEntries = [...lineMap.entries()].sort(([a], [b]) => b - a);

    const lines: string[] = [];
    let prevY: number | null = null;
    let prevFontSize = 0;

    for (const [y, items] of sortedEntries) {
      // ── 3. Detect section gaps: a gap larger than ~1.8× the typical line
      //       height means a section break — emit a blank line.
      if (prevY !== null) {
        const gap = prevY - y;
        const lineHeight = prevFontSize > 0 ? prevFontSize * 1.2 : 14;
        if (gap > lineHeight * 1.8) {
          lines.push('');
        }
      }

      // Sort items left-to-right within the line
      const sorted = [...items].sort((a, b) => a.x - b.x);
      prevFontSize = sorted[0]?.fontSize ?? 0;
      prevY = y;

      // ── 4. Two-column detection: if there's a horizontal gap > 20% of the
      //       page width between two adjacent items, split into separate lines
      //       (handles skills/education two-column resumes).
      const segments: LineItem[][] = [];
      let seg: LineItem[] = [];

      for (let i = 0; i < sorted.length; i++) {
        if (i > 0) {
          const prev = sorted[i - 1];
          const xGap = sorted[i].x - (prev.x + prev.width);
          if (xGap > pageWidth * 0.18) {
            segments.push(seg);
            seg = [];
          }
        }
        seg.push(sorted[i]);
      }
      if (seg.length) segments.push(seg);

      if (segments.length > 1) {
        // Emit each column segment as its own line
        for (const s of segments) {
          const text = s.map(i => i.str).join(' ').replace(/\s{2,}/g, ' ').trim();
          if (text) lines.push(text);
        }
      } else {
        const text = sorted.map(i => i.str).join(' ').replace(/\s{2,}/g, ' ').trim();
        if (text) lines.push(text);
      }
    }

    pageTexts.push(lines.join('\n'));
  }

  return pageTexts
    .join('\n\n')
    .replace(/[ \t]{2,}/g, ' ')    // collapse stray horizontal spaces
    .replace(/\n{4,}/g, '\n\n\n')  // max two blank lines between sections
    .trim();
};
