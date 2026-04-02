import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { method, url, headers, body } = await request.json();

  // Security: only allow proxying to Holded API
  if (!url || !url.startsWith("https://api.holded.com/")) {
    return NextResponse.json({ error: "Invalid target URL" }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: { ...headers },
    };

    if (body && method !== "GET" && method !== "DELETE") {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const responseBody = await response.text();
    const elapsed = Date.now() - startTime;

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      elapsed,
    });
  } catch {
    return NextResponse.json(
      { status: 0, statusText: "Network Error", body: "Failed to reach the API", elapsed: Date.now() - startTime },
      { status: 502 }
    );
  }
}
