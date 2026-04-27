/**
 * fileUtils.js — Shared file compression & Base64 utilities
 * 
 * Fixes slow form submission by:
 * 1. Compressing images via canvas (resize + quality reduction)
 * 2. Running multiple file encodings in parallel with Promise.all
 * 3. Providing a progress-aware API
 */

// ── File Error Toast ────────────────────────────────────────
/**
 * Show a fixed toast notification at the top of the screen.
 * Auto-dismisses after 4 seconds.
 */
function showFileError(message) {
  const TOAST_ID = '__fileValidationToast';
  const existing = document.getElementById(TOAST_ID);
  if (existing) {
    clearTimeout(existing._dismissTimer);
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.id = TOAST_ID;
  toast.textContent = '⚠️  ' + message;

  Object.assign(toast.style, {
    position:        'fixed',
    top:             '24px',
    left:            '50%',
    transform:       'translateX(-50%) translateY(-16px)',
    background:      'linear-gradient(135deg, #7a0e1a 0%, #a81528 100%)',
    color:           '#fff',
    padding:         '14px 28px',
    borderRadius:    '12px',
    fontSize:        '13.5px',
    fontWeight:      '600',
    fontFamily:      "'Inter', 'Segoe UI', sans-serif",
    zIndex:          '2147483647',
    boxShadow:       '0 8px 32px rgba(168,21,40,0.55), 0 2px 12px rgba(0,0,0,0.35)',
    border:          '1px solid rgba(255,120,120,0.35)',
    maxWidth:        '480px',
    width:           '90vw',
    textAlign:       'center',
    opacity:         '0',
    transition:      'opacity 0.25s ease, transform 0.25s ease',
    pointerEvents:   'none',
    lineHeight:      '1.5',
  });

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    })
  );

  // Auto-dismiss
  toast._dismissTimer = setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(-16px)';
    setTimeout(() => toast.remove(), 280);
  }, 4000);
}

// ── File Validation ──────────────────────────────────────────
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB in bytes
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.pdf',
];

// Accept string for <input type="file"> elements
export const FILE_ACCEPT = 'image/jpeg,image/png,image/gif,image/bmp,image/webp,image/svg+xml,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,application/pdf,.pdf';

/**
 * Validate a file against size and type constraints.
 * @param {File} file - The file to validate
 * @returns {string|null} Error message, or null if the file is valid.
 */
export function validateFile(file) {
  if (!file) return null;

  // Check file size (1 MB)
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const msg = `Ukuran file "${file.name}" terlalu besar (${sizeMB} MB). Maksimal 1 MB.`;
    showFileError(msg);
    return msg;
  }

  // Check file type by MIME type
  const mimeOk = ALLOWED_TYPES.includes(file.type);

  // Fallback: check by extension (some browsers might not report MIME correctly)
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (!mimeOk && !extOk) {
    const msg = `Tipe file "${file.name}" tidak didukung. Hanya gambar (JPG, PNG, GIF, BMP, WebP, SVG) dan PDF yang diperbolehkan.`;
    showFileError(msg);
    return msg;
  }

  return null;
}

// ── Image Compression ────────────────────────────────────────

// Maximum dimensions for compressed images
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 0.7; // 0.0 - 1.0

/**
 * Compress an image file using Canvas.
 * Returns a new compressed Blob.
 * Non-image files (PDF, DOC, etc.) are returned as-is.
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    // Only compress image files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas compression failed'));
            return;
          }
          // If compressed is larger than original (rare), use original
          const result = blob.size < file.size ? blob : file;
          resolve(result);
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // If image can't load, return original file
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Convert a file/blob to Base64 string (without the data:... prefix).
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Compress (if image) + convert to Base64 in one step.
 * This is the main function to use in form submissions.
 * 
 * @param {File} file - The file to process
 * @returns {Promise<string>} Base64 encoded string
 */
export async function compressAndEncode(file) {
  const compressed = await compressImage(file);
  const base64 = await blobToBase64(compressed);
  return base64;
}

/**
 * Process multiple files in parallel.
 * 
 * @param {Array<{key: string, file: File}>} files - Array of {key, file} pairs
 * @returns {Promise<Object>} Object with key -> base64 mapping
 * 
 * Example:
 *   const results = await processFilesParallel([
 *     { key: 'logo', file: logoFile },
 *     { key: 'dokId', file: dokIdFile },
 *     { key: 'bayar', file: bayarFile },
 *   ]);
 *   // results = { logo: 'base64...', dokId: 'base64...', bayar: 'base64...' }
 */
export async function processFilesParallel(files) {
  const entries = files.filter(f => f.file); // Skip null/undefined files
  
  const results = await Promise.all(
    entries.map(async ({ key, file }) => {
      const base64 = await compressAndEncode(file);
      return { key, base64 };
    })
  );

  const output = {};
  results.forEach(({ key, base64 }) => {
    output[key] = base64;
  });
  return output;
}
