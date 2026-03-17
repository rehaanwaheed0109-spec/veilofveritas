// netlify/functions/posts.js
// GET  → return all posts
// POST → add a post  (body: JSON post object)
// DELETE ?id=xxx → remove post by id

const { getStore } = require("@netlify/blobs");

const STORE_NAME = "vov_posts";
const KEY = "posts";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function readPosts(store) {
  try {
    const data = await store.get(KEY, { type: "text" });
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writePosts(store, posts) {
  await store.set(KEY, JSON.stringify(posts));
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  let store;
  try {
    store = getStore(STORE_NAME);
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Storage unavailable: " + e.message }),
    };
  }

  if (event.httpMethod === "GET") {
    const posts = await readPosts(store);
    posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return { statusCode: 200, headers, body: JSON.stringify({ posts }) };
  }

  if (event.httpMethod === "POST") {
    let incoming;
    try {
      incoming = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    if (!incoming.title || !incoming.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "title and body required" }) };
    }

    const post = {
      id:        String(incoming.id || Date.now()),
      title:     String(incoming.title),
      body:      String(incoming.body),
      category:  String(incoming.category || "Geopolitics"),
      author:    String(incoming.author || ""),
      imageUrl:  String(incoming.imageUrl || ""),
      timestamp: Number(incoming.timestamp) || Date.now(),
    };

    const posts = await readPosts(store);
    posts.push(post);
    await writePosts(store, posts);
    posts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return { statusCode: 200, headers, body: JSON.stringify({ posts }) };
  }

  if (event.httpMethod === "DELETE") {
    const id = (event.queryStringParameters || {}).id;
    if (!id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "id param required" }) };
    }

    const posts = await readPosts(store);
    const updated = posts.filter((p) => String(p.id) !== String(id));
    await writePosts(store, updated);
    updated.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return { statusCode: 200, headers, body: JSON.stringify({ posts: updated }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
