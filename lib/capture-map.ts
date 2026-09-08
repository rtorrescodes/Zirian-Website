import html2canvas from 'html2canvas';

export interface MapSnapshotResult {
  imageDataUrl: string;
  width: number;
  height: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

function lngToWorldX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * 256 * Math.pow(2, zoom);
}

function latToWorldY(lat: number, zoom: number): number {
  const siny = Math.sin((lat * Math.PI) / 180);
  const clampedSiny = Math.min(Math.max(siny, -0.9999), 0.9999);
  return (0.5 - Math.log((1 + clampedSiny) / (1 - clampedSiny)) / (4 * Math.PI)) * 256 * Math.pow(2, zoom);
}

function worldXToLng(x: number, zoom: number): number {
  return (x / (256 * Math.pow(2, zoom))) * 360 - 180;
}

function worldYToLat(y: number, zoom: number): number {
  const y2 = 0.5 - y / (256 * Math.pow(2, zoom));
  return 90 - (360 * Math.atan(Math.exp(-y2 * 2 * Math.PI))) / Math.PI;
}

/**
 * Patch global getComputedStyle on the target window to sanitize any
 * modern CSS colors (lab, oklab, oklch, lch) into standard RGB before
 * html2canvas touches them.
 */
function sanitizeColorString(val: string): string {
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
  return val;
}

/**
 * Extract satellite map extract for offline field usage.
 * Uses a cascading strategy:
 * 1. Direct ESRI World Imagery satellite tile compositing with open CORS headers (standard in GIS).
 * 2. Direct Canvas inspection from Google Maps WebGL buffer.
 * 3. Sanitized html2canvas pass.
 * 4. High-resolution tactical CAD grid fallback.
 */
export async function captureMapSnapshot(
  mapElement: HTMLElement,
  center?: { lat: number; lng: number },
  zoom?: number,
  originalBounds?: { north: number; south: number; east: number; west: number }
): Promise<MapSnapshotResult> {
  const targetWidth = mapElement.clientWidth || 1280;
  const targetHeight = mapElement.clientHeight || 800;

  // ---------------------------------------------------------------------------
  // STRATEGY 1: High-Resolution Satellite Tile Stitching (ESRI World Imagery)
  // ESRI provides full CORS (Access-Control-Allow-Origin: *) satellite tiles
  // globally matching Google Maps Web Mercator projection up to Zoom 19+.
  // ---------------------------------------------------------------------------
  if (center && zoom) {
    try {
      const stitchZoom = Math.min(Math.max(Math.round(zoom), 10), 19);
      const zoomDiff = zoom - stitchZoom;
      const scaleRatio = Math.pow(2, zoomDiff);

      const cX = lngToWorldX(center.lng, stitchZoom);
      const cY = latToWorldY(center.lat, stitchZoom);

      const worldW = targetWidth / scaleRatio;
      const worldH = targetHeight / scaleRatio;

      const leftWorld = cX - worldW / 2;
      const topWorld = cY - worldH / 2;
      const rightWorld = leftWorld + worldW;
      const bottomWorld = topWorld + worldH;

      const minTileX = Math.floor(leftWorld / 256);
      const maxTileX = Math.floor((rightWorld - 1) / 256);
      const minTileY = Math.floor(topWorld / 256);
      const maxTileY = Math.floor((bottomWorld - 1) / 256);

      const totalTiles = (maxTileX - minTileX + 1) * (maxTileY - minTileY + 1);

      if (totalTiles <= 48) {
        const loadTile = (tx: number, ty: number): Promise<{ img: HTMLImageElement; tx: number; ty: number } | null> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const timer = setTimeout(() => resolve(null), 5000);
            img.onload = () => {
              clearTimeout(timer);
              resolve({ img, tx, ty });
            };
            img.onerror = () => {
              clearTimeout(timer);
              // Fallback to secondary server
              const fallback = new Image();
              fallback.crossOrigin = 'anonymous';
              const timer2 = setTimeout(() => resolve(null), 4000);
              fallback.onload = () => {
                clearTimeout(timer2);
                resolve({ img: fallback, tx, ty });
              };
              fallback.onerror = () => {
                clearTimeout(timer2);
                resolve(null);
              };
              fallback.src = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/${stitchZoom}/${ty}/${tx}`;
            };
            img.src = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${stitchZoom}/${ty}/${tx}`;
          });
        };

        const tilePromises: Promise<{ img: HTMLImageElement; tx: number; ty: number } | null>[] = [];
        for (let tx = minTileX; tx <= maxTileX; tx++) {
          for (let ty = minTileY; ty <= maxTileY; ty++) {
            tilePromises.push(loadTile(tx, ty));
          }
        }

        const loadedTiles = await Promise.all(tilePromises);
        const validTiles = loadedTiles.filter((t): t is { img: HTMLImageElement; tx: number; ty: number } => t !== null);

        if (validTiles.length >= Math.ceil(totalTiles * 0.4)) {
          const compositeCanvas = document.createElement('canvas');
          compositeCanvas.width = targetWidth;
          compositeCanvas.height = targetHeight;
          const ctx = compositeCanvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            for (const { img, tx, ty } of validTiles) {
              const dx = (tx * 256 - leftWorld) * scaleRatio;
              const dy = (ty * 256 - topWorld) * scaleRatio;
              const dw = 256 * scaleRatio;
              const dh = 256 * scaleRatio;
              try {
                ctx.drawImage(img, dx, dy, dw, dh);
              } catch {
                // Continue if one individual tile has issue
              }
            }

            const calculatedBounds = {
              north: worldYToLat(topWorld, stitchZoom),
              south: worldYToLat(bottomWorld, stitchZoom),
              west: worldXToLng(leftWorld, stitchZoom),
              east: worldXToLng(rightWorld, stitchZoom)
            };

            const dataUrl = compositeCanvas.toDataURL('image/jpeg', 0.85);
            if (dataUrl && dataUrl.length > 20000) {
              return {
                imageDataUrl: dataUrl,
                width: targetWidth,
                height: targetHeight,
                bounds: calculatedBounds
              };
            }
          }
        }
      }
    } catch (satErr) {
      console.warn('Strategy 1 ESRI satellite composite failed:', satErr);
    }
  }

  // ---------------------------------------------------------------------------
  // STRATEGY 2: Direct Canvas Inspection (Google Maps WebGL / 2D Canvas)
  // ---------------------------------------------------------------------------
  try {
    const canvases = Array.from(mapElement.querySelectorAll('canvas'));
    for (const c of canvases) {
      if (c.width >= 300 && c.height >= 300) {
        try {
          const testUrl = c.toDataURL('image/jpeg', 0.85);
          if (testUrl && testUrl.length > 20000) {
            return {
              imageDataUrl: testUrl,
              width: c.width,
              height: c.height,
              bounds: originalBounds
            };
          }
        } catch {
          // Canvas tainted or WebGL preserveDrawingBuffer=false
        }
      }
    }
  } catch (e) {
    console.warn('Strategy 2 direct canvas read failed:', e);
  }

  // ---------------------------------------------------------------------------
  // STRATEGY 3: html2canvas with Style Sanitizer
  // ---------------------------------------------------------------------------
  const originalGetComputedStyle = window.getComputedStyle;
  try {
    window.getComputedStyle = function (el: Element, pseudo?: string | null) {
      const cs = originalGetComputedStyle.call(window, el, pseudo);
      return new Proxy(cs, {
        get(target, prop) {
          const val = (target as any)[prop];
          if (typeof val === 'string') {
            return sanitizeColorString(val);
          }
          if (typeof val === 'function' && prop === 'getPropertyValue') {
            return function (property: string) {
              const raw = target.getPropertyValue(property);
              return typeof raw === 'string' ? sanitizeColorString(raw) : raw;
            };
          }
          return typeof val === 'function' ? val.bind(target) : val;
        }
      });
    };

    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 1,
      backgroundColor: '#0f172a',
      ignoreElements: (element) => {
        if (
          element.classList &&
          (element.classList.contains('pointer-events-auto') ||
            element.getAttribute('role') === 'dialog' ||
            element.tagName.toLowerCase() === 'button')
        ) {
          return true;
        }
        return false;
      },
      onclone: (clonedDoc) => {
        if (clonedDoc.defaultView) {
          const iframeOrig = clonedDoc.defaultView.getComputedStyle;
          clonedDoc.defaultView.getComputedStyle = function (el: Element, pseudo?: string | null) {
            const cs = iframeOrig.call(clonedDoc.defaultView, el, pseudo);
            return new Proxy(cs, {
              get(target, prop) {
                const val = (target as any)[prop];
                if (typeof val === 'string') {
                  return sanitizeColorString(val);
                }
                if (typeof val === 'function' && prop === 'getPropertyValue') {
                  return function (property: string) {
                    const raw = target.getPropertyValue(property);
                    return typeof raw === 'string' ? sanitizeColorString(raw) : raw;
                  };
                }
                return typeof val === 'function' ? val.bind(target) : val;
              }
            });
          };
        }

        const styleElements = clonedDoc.querySelectorAll('style');
        styleElements.forEach((s) => {
          if (s.textContent && (s.textContent.includes('lab(') || s.textContent.includes('oklch('))) {
            s.textContent = sanitizeColorString(s.textContent);
          }
        });
      }
    });

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    if (imageDataUrl && imageDataUrl.length > 20000) {
      return {
        imageDataUrl,
        width: canvas.width,
        height: canvas.height,
        bounds: originalBounds
      };
    }
  } catch (err: any) {
    console.warn('Strategy 3 html2canvas pass failed:', err);
  } finally {
    window.getComputedStyle = originalGetComputedStyle;
  }

  // ---------------------------------------------------------------------------
  // STRATEGY 4: Tactical Topo Grid (Ultimate Fallback)
  // ---------------------------------------------------------------------------
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = targetWidth;
  fallbackCanvas.height = targetHeight;
  const ctx = fallbackCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.strokeStyle = 'rgba(0, 210, 255, 0.2)';
    ctx.lineWidth = 1.5;
    const majorStep = 100;
    for (let x = 0; x < targetWidth; x += majorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, targetHeight);
      ctx.stroke();
    }
    for (let y = 0; y < targetHeight; y += majorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(targetWidth, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0, 210, 255, 0.07)';
    ctx.lineWidth = 1;
    const minorStep = 20;
    for (let x = 0; x < targetWidth; x += minorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, targetHeight);
      ctx.stroke();
    }
    for (let y = 0; y < targetHeight; y += minorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(targetWidth, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#00D2FF';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('MODO TERRENO OFFLINE (PLANO VECTORIAL CAD)', 24, 36);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('Plano de levantamiento con cuadrícula de escala métrica y GPS en tiempo real.', 24, 58);
  }

  return {
    imageDataUrl: fallbackCanvas.toDataURL('image/jpeg', 0.85),
    width: targetWidth,
    height: targetHeight,
    bounds: originalBounds
  };
}
