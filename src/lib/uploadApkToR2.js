import { generateUploadUrl } from "@/functions/generateUploadUrl";

/**
 * Uploads an APK file directly to Cloudflare R2 using a presigned PUT URL.
 * Returns real byte-level progress via XHR (fetch has no upload progress).
 * @param {File} file
 * @param {(pct:number)=>void} [onProgress]
 * @returns {Promise<{publicUrl:string, fileKey:string}>}
 */
export function uploadApkToR2(file, onProgress) {
  return new Promise(async (resolve, reject) => {
    let res;
    try {
      res = await generateUploadUrl({
        fileName: file.name,
        contentType: file.type || "application/vnd.android.package-archive",
      });
    } catch (err) {
      return reject(err);
    }
    const data = res && res.data !== undefined ? res.data : res;
    if (!data || !data.success || !data.uploadUrl) {
      return reject(new Error("فشل في الحصول على رابط الرفع"));
    }

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.uploadUrl, true);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/vnd.android.package-archive"
    );
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve({ publicUrl: data.publicUrl, fileKey: data.fileKey });
      } else {
        reject(new Error(`R2 upload failed: HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}