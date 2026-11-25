import { ImageQualityReport } from '../types/aniguard';

const recentFingerprints = new Set<string>();

/**
 * Client-side Image Quality Verification (PRD Section 9):
 * Checks file type/size, resolution, brightness/exposure, glare, sharpness, and duplicates
 * before running any observation workflow.
 */
export async function analyzeImageQuality(file: File): Promise<ImageQualityReport> {
  const fileSizeKb = Math.round(file.size / 1024);
  const checks: ImageQualityReport['checks'] = [];

  // 1. Format & Size Check
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    checks.push({
      name: 'File Format',
      status: 'fail',
      detail: `Unsupported format (${file.type || 'unknown'}). Use JPG, PNG, or WebP.`,
    });
  } else if (fileSizeKb < 15) {
    checks.push({
      name: 'File Size',
      status: 'fail',
      detail: `Image too small (${fileSizeKb} KB). May lack diagnostic detail.`,
    });
  } else if (fileSizeKb > 10240) {
    checks.push({
      name: 'File Size',
      status: 'fail',
      detail: `Image exceeds 10 MB (${(fileSizeKb / 1024).toFixed(1)} MB).`,
    });
  } else {
    checks.push({
      name: 'File Size & Format',
      status: 'pass',
      detail: `${fileSizeKb} KB · ${file.type.replace('image/', '').toUpperCase()}`,
    });
  }

  // 2. Duplicate Detection
  const fingerprint = `${file.name}_${file.size}_${file.lastModified}`;
  const isDuplicate = recentFingerprints.has(fingerprint);
  recentFingerprints.add(fingerprint);
  checks.push({
    name: 'Duplicate Check',
    status: isDuplicate ? 'warn' : 'pass',
    detail: isDuplicate
      ? 'This exact file was already analyzed in this session.'
      : 'Unique image capture',
  });

  // 3. Load onto offscreen canvas for pixel inspection
  const imageData = await loadImageMetrics(file);
  const { width, height, brightness, glareRatio, sharpness } = imageData;

  // Resolution check
  if (width < 320 || height < 240) {
    checks.push({
      name: 'Resolution',
      status: 'fail',
      detail: `${width}×${height}px is below minimum 320×240px.`,
    });
  } else {
    checks.push({
      name: 'Resolution',
      status: 'pass',
      detail: `${width}×${height}px`,
    });
  }

  // Sharpness / Blur check
  if (sharpness < 14) {
    checks.push({
      name: 'Sharpness / Blur',
      status: 'fail',
      detail: `Blurry image (score ${sharpness}/100). Hold camera steady and tap to focus.`,
    });
  } else if (sharpness < 24) {
    checks.push({
      name: 'Sharpness / Blur',
      status: 'warn',
      detail: `Slightly soft focus (score ${sharpness}/100).`,
    });
  } else {
    checks.push({
      name: 'Sharpness / Blur',
      status: 'pass',
      detail: `Clear focus (score ${sharpness}/100)`,
    });
  }

  // Brightness & Glare check
  if (brightness < 45) {
    checks.push({
      name: 'Lighting / Exposure',
      status: 'fail',
      detail: 'Image is too dark. Move animal to natural daylight or turn on shed light.',
    });
  } else if (brightness > 225 || glareRatio > 0.22) {
    checks.push({
      name: 'Lighting / Glare',
      status: 'warn',
      detail: 'High glare or overexposure detected. Avoid direct flash/sunlight reflection.',
    });
  } else {
    checks.push({
      name: 'Lighting & Exposure',
      status: 'pass',
      detail: `Balanced daylight exposure (${Math.round(brightness)}/255)`,
    });
  }

  const hasFail = checks.some((c) => c.status === 'fail');
  const hasWarn = checks.some((c) => c.status === 'warn');

  const guidance = hasFail
    ? 'Image quality failed one or more checks. Please retake a clear, well-lit photo before relying on visual observations.'
    : hasWarn
    ? 'Image is usable with minor lighting/focus warnings.'
    : 'All image quality checks passed. Ready for observation recording.';

  return {
    is_usable: !hasFail,
    width,
    height,
    file_size_kb: fileSizeKb,
    sharpness_score: sharpness,
    brightness_score: Math.round(brightness),
    glare_ratio: Number(glareRatio.toFixed(3)),
    checks,
    guidance,
  };
}

function loadImageMetrics(file: File): Promise<{
  width: number;
  height: number;
  brightness: number;
  glareRatio: number;
  sharpness: number;
}> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Downsample for fast edge/brightness calculation
        const sampleW = Math.min(200, width);
        const sampleH = Math.max(1, Math.round((height / Math.max(1, width)) * sampleW));

        const canvas = document.createElement('canvas');
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve({ width, height, brightness: 128, glareRatio: 0, sharpness: 50 });
          return;
        }

        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const { data } = ctx.getImageData(0, 0, sampleW, sampleH);
        const totalPixels = sampleW * sampleH;
        const luminances = new Float32Array(totalPixels);

        let sumLum = 0;
        let glarePixels = 0;

        for (let i = 0; i < totalPixels; i++) {
          const idx = i * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          luminances[i] = lum;
          sumLum += lum;
          if (lum > 246) glarePixels++;
        }

        // Edge-gradient variance proxy for sharpness
        let gradSum = 0;
        let gradCount = 0;
        for (let y = 1; y < sampleH - 1; y++) {
          for (let x = 1; x < sampleW - 1; x++) {
            const c = luminances[y * sampleW + x];
            const dx = Math.abs(c - luminances[y * sampleW + (x + 1)]);
            const dy = Math.abs(c - luminances[(y + 1) * sampleW + x]);
            gradSum += dx + dy;
            gradCount++;
          }
        }

        const avgGrad = gradCount > 0 ? gradSum / gradCount : 0;
        const sharpness = Math.min(100, Math.round(avgGrad * 2.2));

        URL.revokeObjectURL(url);
        resolve({
          width,
          height,
          brightness: sumLum / Math.max(1, totalPixels),
          glareRatio: glarePixels / Math.max(1, totalPixels),
          sharpness,
        });
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode image file'));
    };

    img.src = url;
  });
}
