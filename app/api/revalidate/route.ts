import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { WP_CACHE_TAGS } from "@/lib/wordpress/config";

export const runtime = "nodejs";

type RevalidateBody = {
  secret?: string;
  event?: string;
  slug?: string;
  id?: number | string;
  path?: string;
};

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function readSecret(req: NextRequest, body: RevalidateBody): string | null {
  const header =
    req.headers.get("x-tekcroft-revalidate-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return header || body.secret || req.nextUrl.searchParams.get("secret");
}

async function handle(req: NextRequest) {
  const expected = process.env.REVALIDATION_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATION_SECRET is not configured" },
      { status: 500 }
    );
  }

  let body: RevalidateBody = {};
  if (req.method === "POST") {
    try {
      body = (await req.json()) as RevalidateBody;
    } catch {
      body = {};
    }
  }

  const provided = readSecret(req, body);
  if (!provided || provided !== expected) return unauthorized();

  const slug =
    body.slug ||
    req.nextUrl.searchParams.get("slug") ||
    undefined;
  const event =
    body.event ||
    req.nextUrl.searchParams.get("event") ||
    "post.save";

  try {
    revalidateTag(WP_CACHE_TAGS.all, { expire: 0 });
    revalidateTag(WP_CACHE_TAGS.posts, { expire: 0 });
    revalidateTag(WP_CACHE_TAGS.categories, { expire: 0 });
    revalidateTag(WP_CACHE_TAGS.tags, { expire: 0 });

    revalidatePath("/blog");
    revalidatePath("/blog", "layout");
    revalidatePath("/sitemap.xml");

    if (slug) {
      revalidateTag(WP_CACHE_TAGS.post(slug), { expire: 0 });
      revalidatePath(`/blog/${slug}`);
    }

    if (body.path) {
      revalidatePath(body.path);
    }

    return NextResponse.json({
      ok: true,
      revalidated: true,
      event,
      slug: slug || null,
      now: Date.now(),
    });
  } catch (err) {
    console.error("[revalidate]", err);
    return NextResponse.json(
      { ok: false, error: "Revalidation failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
