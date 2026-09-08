import html2canvas from 'html2canvas';

export interface MapSnapshotResult {
  imageDataUrl: string;
  width: number;
  height: number;
}

/**
 * Robust map screenshot utility that circumvents Tailwind CSS v4
 * unsupported color function "lab()" / "oklch()" crashes in html2canvas.
 */
export async function captureMapSnapshot(mapElement: HTMLElement): Promise<MapSnapshotResult> {
  // Strategy 1: Direct Canvas Inspection (WebGL / 2D from Google Maps engine)
  try {
    const canvases = mapElement.querySelectorAll('canvas');
    for (let i = 0; i < canvases.length; i++) {
      const c = canvases[i] as HTMLCanvasElement;
      if (c.width > 300 && c.height > 300) {
        try {
          const testUrl = c.toDataURL('image/jpeg', 0.85);
          if (testUrl && testUrl.length > 5000) {
            return {
              imageDataUrl: testUrl,
              width: c.width,
              height: c.height
            };
          }
        } catch (e) {
          // Canvas tainted by CORS tiles, fallback to html2canvas
        }
      }
    }
  } catch (e) {
    // Proceed to html2canvas
  }

  // Strategy 2: html2canvas with computedStyle proxy and stylesheet sanitizer
  try {
    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 1.2,
      onclone: (clonedDoc) => {
        // Intercept getComputedStyle to replace lab(), oklab(), oklch(), lch() with standard colors
        if (clonedDoc.defaultView) {
          const origGetComputedStyle = clonedDoc.defaultView.getComputedStyle.bind(clonedDoc.defaultView);
          clonedDoc.defaultView.getComputedStyle = function (el: Element, pseudo?: string | null) {
            const cs = origGetComputedStyle(el, pseudo);
            return new Proxy(cs, {
              get(target, prop) {
                const val = (target as any)[prop];
                if (
                  typeof val === 'string' &&
                  (val.includes('lab(') || val.includes('oklch(') || val.includes('oklab(') || val.includes('lch('))
                ) {
                  return val
                    .replace(/oklch\([^)]+\)/gi, '#0f172a')
                    .replace(/lab\([^)]+\)/gi, '#0f172a')
                    .replace(/oklab\([^)]+\)/gi, '#0f172a')
                    .replace(/lch\([^)]+\)/gi, '#0f172a');
                }
                if (typeof val === 'function') {
                  if (prop === 'getPropertyValue') {
                    return function (property: string) {
                      const raw = target.getPropertyValue(property);
                      if (
                        raw &&
                        (raw.includes('lab(') || raw.includes('oklch(') || raw.includes('oklab(') || raw.includes('lch('))
                      ) {
                        return raw
                          .replace(/oklch\([^)]+\)/gi, '#0f172a')
                          .replace(/lab\([^)]+\)/gi, '#0f172a')
                          .replace(/oklab\([^)]+\)/gi, '#0f172a')
                          .replace(/lch\([^)]+\)/gi, '#0f172a');
                      }
                      return raw;
                    };
                  }
                  return val.bind(target);
                }
                return val;
              }
            });
          };
        }

        // Sanitize any style tags inside the cloned document head
        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((s) => {
          if (s.textContent && (s.textContent.includes('lab(') || s.textContent.includes('oklch('))) {
            s.textContent = s.textContent
              .replace(/oklch\([^)]+\)/gi, '#0f172a')
              .replace(/lab\([^)]+\)/gi, '#0f172a')
              .replace(/oklab\([^)]+\)/gi, '#0f172a')
              .replace(/lch\([^)]+\)/gi, '#0f172a');
          }
        });
      }
    });

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    return {
      imageDataUrl,
      width: canvas.width,
      height: canvas.height
    };
  } catch (err: any) {
    console.warn('html2canvas sanitized pass failed, creating fallback raster canvas:', err);

    // Strategy 3: Reliable fallback raster canvas with field coordinates grid
    const w = mapElement.clientWidth || 1024;
    const h = mapElement.clientHeight || 768;
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = w;
    fallbackCanvas.height = h;
    const ctx = fallbackCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0b1329';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0, 163, 255, 0.15)';
      ctx.lineWidth = 1;
      const step = 50;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('LEVANTAMIENTO DE CAMPO (SALARA) - MODO TERRENO', 24, 36);
    }
    return {
      imageDataUrl: fallbackCanvas.toDataURL('image/jpeg', 0.85),
      width: w,
      height: h
    };
  }
}
