import { appParams } from "@/lib/app-params";

/**
 * Uploads a file to the Base44 Core UploadFile endpoint with REAL byte-level
 * progress reporting (the SDK's UploadFile integration doesn't expose progress).
 * Hits the same endpoint the SDK uses, with the same auth token.
 *
 * @param {File} file
 * @param {(pct:number)=>void} [onProgress] 0..100
 * @returns {Promise<string>} file_url
 */
export function uploadWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const { appId, token } = appParams;
    if (!appId) {
      reject(new Error("Missing app id"));
      return;
    }
    const formData = new FormData();
    formData.append("file", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/apps/${appId}/integration-endpoints/Core/UploadFile`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const url = data?.file_url ?? (typeof data === "string" ? data : null);
          if (url) resolve(url);
          else reject(new Error("Upload returned no file url"));
        } catch {
          reject(new Error("Upload returned invalid response"));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));
    xhr.timeout = 0; // no timeout — let the browser manage it; APKs can be large
    xhr.send(formData);
  });
}