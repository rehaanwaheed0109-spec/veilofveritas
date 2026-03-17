// netlify/functions/posts.js
// Handles GET / POST / DELETE for blog posts using Netlify Blobs

const { getStore } = require("@netlify/blobs");

const BLOB_KEY = "all_posts";

// ── helpers ────────────────────────────────────────────────────────────────────

async function loadPosts(store) {
  try {
    const raw = await store.get(BLOB_KEY, { type: "text" });
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function savePosts(store, posts) {
  await store.set(BLOB_KEY, JSON.stringify(posts));
}

function cors(headers = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    ...headers,
  };
}

// ── handler ────────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors() };
  }

  const store = getStore("vov_posts");

  // ── GET — return all posts ─────────────────────────────────────────────────
  if (event.httpMethod === "GET") {
    const posts = await loadPosts(store);
    const sorted = posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ posts: sorted }),
    };
  }

  // ── POST — add a new post ──────────────────────────────────────────────────
  if (event.httpMethod === "POST") {
    let incoming;
    try {
      incoming = JSON.parse(event.body || "{}");
    } catch {
      return {
        statusCode: 400,
        headers: cors(),
        body: JSON.stringify({ error: "Invalid JSON body." }),
      };
    }

    if (!incoming.title || !incoming.body) {
      return {
        statusCode: 400,
        headers: cors(),
        body: JSON.stringify({ error: "title and body are required." }),
      };
    }

    const post = {
      id:        incoming.id        || Date.now().toString(),
      title:     incoming.title,
      body:      incoming.body,
      category:  incoming.category  || "Geopolitics",
      author:    incoming.author    || "",
      imageUrl:  incoming.imageUrl  || "",
      timestamp: incoming.timestamp || Date.now(),
    };

    const posts = await loadPosts(store);
    posts.push(post);
    await savePosts(store, posts);

    const sorted = posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ posts: sorted }),
    };
  }

  // ── DELETE — remove post by ?id= ──────────────────────────────────────────
  if (event.httpMethod === "DELETE") {
    const id = (event.queryStringParameters || {}).id;
    if (!id) {
      return {
        statusCode: 400,
        headers: cors(),
        body: JSON.stringify({ error: "Missing id query param." }),
      };
    }

    const posts   = await loadPosts(store);
    const updated = posts.filter((p) => String(p.id) !== String(id));
    await savePosts(store, updated);

    const sorted = updated.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return {
      statusCode: 200,
      headers: cors(),
      body: JSON.stringify({ posts: sorted }),
    };
  }

  return {
    statusCode: 405,
    headers: cors(),
    body: JSON.stringify({ error: "Method not allowed." }),
  };
};
