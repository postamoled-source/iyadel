import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const name = (body?.name || '').toString().slice(0, 60).trim();
    const style = (body?.style || 'Minimalist').toString().slice(0, 30);
    const tagline = (body?.tagline || '').toString().slice(0, 80);
    if (!name) return Response.json({ error: 'Brand name is required' }, { status: 400 });

    const prompt = `A professional, high-quality logo design for a brand called "${name}". Style: ${style}. ${tagline ? `Tagline: "${tagline}". ` : ''}Clean vector-style logo mark, centered composition, simple flat background, modern branding identity, crisp edges, no photographs, no watermarks.`;
    const result = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt });
    const url = result && result.url;
    if (!url) return Response.json({ error: 'Generation failed' }, { status: 500 });

    return Response.json({ url });
  } catch (error) {
    return Response.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}