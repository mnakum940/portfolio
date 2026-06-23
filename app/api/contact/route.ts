import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
  }

  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch current messages from Supabase
    const fetchRes = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_store?key=eq.messages`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 0 },
    });

    let currentMessages = [];
    if (fetchRes.ok) {
      const rows = await fetchRes.json();
      if (rows && rows.length > 0) {
        currentMessages = rows[0].value || [];
      }
    }

    // 2. Create the new contact message object
    const newMsg = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      name: name.trim(),
      email: email.trim(),
      subject: (subject || "Collaboration Inquiry").trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      status: "UNREAD" as const,
    };

    const updatedMessages = [newMsg, ...currentMessages];

    // 3. Write back the updated messages list to Supabase
    const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_store`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        key: "messages",
        value: updatedMessages,
      }),
    });

    if (!saveRes.ok) {
      const errText = await saveRes.text();
      return NextResponse.json({ error: `Supabase save error: ${errText}` }, { status: saveRes.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
