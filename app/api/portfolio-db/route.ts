import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Get all keys
export async function GET(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const password = searchParams.get("password");
    const isAdmin = password === "meet123";

    const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_store`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 0 }, // Disable Next.js caching to ensure fresh fetches
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Supabase error: ${errText}` }, { status: res.status });
    }

    const rows = await res.json();
    
    // Reduce array of {key, value} to a single object
    const data = (rows as Array<{ key: string; value: unknown }>).reduce((acc: Record<string, unknown>, row) => {
      // Secure messages key
      if (row.key === "messages" && !isAdmin) {
        return acc;
      }
      acc[row.key] = row.value;
      return acc;
    }, {});

    return NextResponse.json(data);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Set/Update a key (updates a single type's value, e.g. projects, settings, skills)
export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  try {
    const { type, data, password } = await req.json();

    if (password !== "meet123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!type || data === undefined) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_store`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        key: type,
        value: data,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Supabase error: ${errText}` }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
