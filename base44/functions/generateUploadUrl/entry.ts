import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { secrets } from "base44:runtime";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.700.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.700.0";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { fileName, contentType } = await req.json();
    if (!fileName || typeof fileName !== "string") {
      return Response.json({ error: "اسم الملف مطلوب" }, { status: 400 });
    }

    const accountId = secrets.get("R2_ACCOUNT_ID");
    const accessKeyId = secrets.get("R2_ACCESS_KEY_ID");
    const secretAccessKey = secrets.get("R2_SECRET_ACCESS_KEY");
    const bucketName = secrets.get("R2_BUCKET_NAME");
    const publicBaseUrl = secrets.get("R2_PUBLIC_BASE_URL");

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
      return Response.json({ error: "الخدمة غير مهيأة بشكل صحيح" }, { status: 500 });
    }

    // sanitize fileName to avoid path injection / weird chars
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const fileKey = `apks/${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType || "application/vnd.android.package-archive",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const base = publicBaseUrl.replace(/\/+$/, "");
    const publicUrl = `${base}/${fileKey}`;

    return Response.json({
      success: true,
      uploadUrl,
      fileKey,
      publicUrl,
    });
  } catch (error: any) {
    return Response.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}