const POSTS_API = "/.netlify/functions/posts";
const ADMIN_PASSWORD = "fthgnau5643*";

let postsCache = [];

async function getPosts(forceRefresh = false) {
  if (!forceRefresh && postsCache.length > 0) {
    return postsCache;
  }

  try {
    const response = await fetch(POSTS_API, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to load posts.");
    }

    const payload = await response.json();
    postsCache = Array.isArray(payload.posts) ? payload.posts : [];
    return postsCache;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function createPost(post) {
  const response = await fetch(POSTS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(post)
  });

  if (!response.ok) {
    throw new Error("Failed to publish post.");
  }

  const payload = await response.json();
  postsCache = Array.isArray(payload.posts) ? payload.posts : [];
  return payload;
}

async function removePost(id) {
  const response = await fetch(`${POSTS_API}?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Failed to delete post.");
  }

  const payload = await response.json();
  postsCache = Array.isArray(payload.posts) ? payload.posts : [];
  return payload;
}

function openPostModal(post) {
  const existing = document.getElementById("post-modal");
  if (existing) existing.remove();

  const date = post.timestamp
    ? new Date(post.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Undated";

  const modal = document.createElement("div");
  modal.id = "post-modal";
  modal.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(5,5,10,0.97);z-index:9999;
    overflow-y:auto;display:flex;flex-direction:column;align-items:center;
    animation:modalFadeIn 0.3s ease;
  `;

  const imageHtml = post.imageUrl
    ? `<div style="width:100%;max-height:420px;overflow:hidden;margin-bottom:40px;"><img src="${escapeHTML(post.imageUrl)}" alt="" style="width:100%;max-height:420px;object-fit:cover;display:block;filter:brightness(0.9);"></div>`
    : "";

  const authorHtml = post.author
    ? `<div style="font-family:'IBM Plex Mono',monospace;font-size:0.7rem;letter-spacing:0.18em;text-transform:uppercase;color:rgba(167,139,250,0.8);margin-bottom:8px;">By ${escapeHTML(post.author)}</div>`
    : "";

  const bodyHtml = (post.body || "")
    .split(/\n\n+/)
    .map((paragraph) => {
      return `<p style="font-size:1.05rem;color:rgba(244,244,246,0.78);line-height:1.9;margin-bottom:24px;">${escapeHTML(paragraph.trim())}</p>`;
    })
    .join("");

  modal.innerHTML = `
    <div style="width:100%;max-width:780px;padding:60px 32px 100px;">
      <button id="modal-close-btn" style="
        background:none;border:1px solid rgba(139,92,246,0.35);color:rgba(167,139,250,0.8);
        font-family:'IBM Plex Mono',monospace;font-size:0.65rem;letter-spacing:0.2em;
        text-transform:uppercase;padding:10px 22px;cursor:pointer;margin-bottom:48px;
        transition:border-color 0.2s,color 0.2s;display:inline-flex;align-items:center;gap:10px;
      ">< Back</button>
      ${imageHtml}
      <div style="font-family:'IBM Plex Mono',monospace;font-size:0.62rem;letter-spacing:0.22em;text-transform:uppercase;color:rgba(167,139,250,0.7);margin-bottom:16px;">
        Analysis &nbsp;/&nbsp; ${escapeHTML(post.category || "Geopolitics")}
      </div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:2.4rem;font-weight:700;color:#f4f4f6;line-height:1.25;margin-bottom:24px;">${escapeHTML(post.title)}</h1>
      ${authorHtml}
      <div style="font-family:'IBM Plex Mono',monospace;font-size:0.62rem;letter-spacing:0.12em;color:rgba(244,244,246,0.3);margin-bottom:48px;padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.08);">
        ${date}
      </div>
      <div class="post-modal-body">
        ${bodyHtml}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.scrollTop = 0;
  document.body.style.overflow = "hidden";

  document.getElementById("modal-close-btn").addEventListener("click", closePostModal);
  modal.addEventListener("click", function(e) {
    if (e.target === modal) closePostModal();
  });
  document.addEventListener("keydown", onModalKeydown);
}

function closePostModal() {
  const modal = document.getElementById("post-modal");
  if (modal) {
    modal.style.animation = "modalFadeOut 0.2s ease forwards";
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = "";
    }, 200);
  }
  document.removeEventListener("keydown", onModalKeydown);
}

function onModalKeydown(e) {
  if (e.key === "Escape") closePostModal();
}

async function renderPosts() {
  const grid = document.getElementById("posts-grid");
  if (!grid) return;

  const posts = await getPosts(true);

  if (posts.length === 0) {
    grid.innerHTML = `
      <div class="no-posts">
        <p style="font-family:'IBM Plex Mono',monospace;font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;color:rgba(244,244,246,0.25);margin-bottom:8px;">No Dispatches Yet</p>
        <p style="font-size:0.85rem;color:rgba(244,244,246,0.3);">Analysis will appear here once published via the admin panel.</p>
      </div>`;
    return;
  }

  grid.innerHTML = "";

  const sorted = [...posts].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const limit = parseInt(grid.dataset.limit || "0", 10);
  const visiblePosts = limit > 0 ? sorted.slice(0, limit) : sorted;

  visiblePosts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.style.cursor = "pointer";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const date = post.timestamp
      ? new Date(post.timestamp).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      : "Undated";

    const preview = (post.body || "").length > 220
      ? post.body.substring(0, 220) + "..."
      : post.body;

    const imageHtml = post.imageUrl
      ? `<div class="post-image-wrap"><img class="post-image" src="${escapeHTML(post.imageUrl)}" alt="" loading="lazy"></div>`
      : "";

    const authorHtml = post.author
      ? `<div style="font-family:'IBM Plex Mono',monospace;font-size:0.6rem;letter-spacing:0.14em;text-transform:uppercase;color:rgba(167,139,250,0.75);margin-bottom:8px;">By ${escapeHTML(post.author)}</div>`
      : "";

    card.innerHTML = `
      ${imageHtml}
      <div class="post-tag">Analysis &nbsp;/&nbsp; ${escapeHTML(post.category || "Geopolitics")}</div>
      <div class="post-title">${escapeHTML(post.title)}</div>
      ${authorHtml}
      <div class="post-body">${escapeHTML(preview)}</div>
      <div class="post-meta">${date} &nbsp;·&nbsp; <span style="color:rgba(167,139,250,0.6);">Read more -></span></div>`;

    card.addEventListener("click", () => openPostModal(post));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPostModal(post);
      }
    });

    grid.appendChild(card);
  });
}

function escapeHTML(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateForm(formEl) {
  let valid = true;

  formEl.querySelectorAll(".field-error").forEach((el) => el.remove());
  formEl.querySelectorAll(".form-control").forEach((el) => el.classList.remove("error"));

  formEl.querySelectorAll("[data-required]").forEach((field) => {
    const val = field.value.trim();
    if (!val) {
      valid = false;
      field.classList.add("error");
      const err = document.createElement("div");
      err.className = "field-error";
      err.textContent = "This field is required.";
      field.parentNode.appendChild(err);
    }
  });

  formEl.querySelectorAll('input[type="email"]').forEach((field) => {
    const val = field.value.trim();
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      valid = false;
      field.classList.add("error");
      const err = document.createElement("div");
      err.className = "field-error";
      err.textContent = "Please enter a valid email address.";
      field.parentNode.appendChild(err);
    }
  });

  return valid;
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "newsletter") {
    const subjectField = document.getElementById("c-subject");
    const messageField = document.getElementById("c-message");
    const emailField = document.getElementById("c-email");

    if (subjectField && !subjectField.value.trim()) {
      subjectField.value = "Newsletter Subscription";
    }
    if (messageField && !messageField.value.trim()) {
      messageField.value = "Hi Veil of Veritas team,\n\nPlease subscribe me to your newsletter.\n\nThank you.";
    }
    if (emailField) {
      emailField.focus();
    }
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!validateForm(form)) return;

    const name = (document.getElementById("c-name") || {}).value || "";
    const email = (document.getElementById("c-email") || {}).value || "";
    const subject = (document.getElementById("c-subject") || {}).value || "Contact Form Submission";
    const message = (document.getElementById("c-message") || {}).value || "";

    const mailtoHref = "mailto:rehaanwaheed0109@gmail.com,suhanibhuwania@gmail.com"
      + "?subject=" + encodeURIComponent("[VoV Contact] " + subject)
      + "&body=" + encodeURIComponent("From: " + name + " <" + email + ">\n\n" + message);

    const a = document.createElement("a");
    a.href = mailtoHref;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);

    const success = document.getElementById("form-success");
    form.style.opacity = "0.3";
    form.style.pointerEvents = "none";
    if (success) success.classList.add("visible");
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function initVolunteerForm() {
  const form = document.getElementById("volunteer-form");
  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!validateForm(form)) return;

    const name = (document.getElementById("v-name") || {}).value || "";
    const email = (document.getElementById("v-email") || {}).value || "";
    const area = (document.getElementById("v-area") || {}).value || "General";
    const message = (document.getElementById("v-message") || {}).value || "";

    const mailtoHref = "mailto:rehaanwaheed0109@gmail.com,suhanibhuwania@gmail.com"
      + "?subject=" + encodeURIComponent("[VoV Volunteer] Application - " + area)
      + "&body=" + encodeURIComponent("From: " + name + " <" + email + ">\nArea of Interest: " + area + "\n\n" + message);

    const a = document.createElement("a");
    a.href = mailtoHref;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 200);

    const success = document.getElementById("form-success");
    form.style.opacity = "0.3";
    form.style.pointerEvents = "none";
    if (success) success.classList.add("visible");
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function initAdmin() {
  const gate = document.getElementById("admin-auth-gate");
  const panel = document.getElementById("admin-panel");
  if (!gate || !panel) return;

  if (sessionStorage.getItem("vov_admin") === "1") {
    gate.style.display = "none";
    panel.style.display = "block";
    renderAdminPosts();
    return;
  }

  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const pw = document.getElementById("admin-pw").value;
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("vov_admin", "1");
      gate.style.display = "none";
      panel.style.display = "block";
      renderAdminPosts();
    } else {
      const err = document.getElementById("login-error");
      if (err) err.textContent = "Incorrect password.";
    }
  });
}

function initPublishForm() {
  const form = document.getElementById("publish-form");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    if (!validateForm(form)) return;

    const title = document.getElementById("post-title").value.trim();
    const body = document.getElementById("post-body").value.trim();
    const category = document.getElementById("post-category").value || "Geopolitics";
    const author = document.getElementById("post-author") ? document.getElementById("post-author").value.trim() : "";
    const imageUrl = window._postImageData
      || (document.getElementById("post-image-url") ? document.getElementById("post-image-url").value.trim() : "");

    try {
      await createPost({
        title,
        body,
        category,
        author,
        imageUrl
      });

      form.reset();
      window._postImageData = null;

      const previewWrap = document.getElementById("image-preview-wrap");
      if (previewWrap) previewWrap.style.display = "none";

      const labelText = document.getElementById("upload-label-text");
      if (labelText) labelText.textContent = "Upload Image";

      await Promise.all([renderPosts(), renderAdminPosts()]);

      const msg = document.getElementById("publish-success");
      if (msg) {
        msg.classList.add("visible");
        setTimeout(() => msg.classList.remove("visible"), 4000);
      }
    } catch (error) {
      console.error(error);
      const errMsg = document.getElementById("publish-error");
      if (errMsg) {
        errMsg.textContent = "Publishing failed: " + error.message;
        errMsg.style.display = "block";
        setTimeout(() => { errMsg.style.display = "none"; }, 6000);
      }
    }
  });
}

async function renderAdminPosts() {
  const list = document.getElementById("admin-posts-list");
  if (!list) return;

  const posts = await getPosts(true);
  if (posts.length === 0) {
    list.innerHTML = `<p style="font-family:'IBM Plex Mono',monospace;font-size:0.7rem;color:rgba(244,244,246,0.25);letter-spacing:0.12em;">No posts published yet.</p>`;
    return;
  }

  const sorted = [...posts].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  list.innerHTML = "";

  sorted.forEach((post) => {
    const item = document.createElement("div");
    item.className = "admin-post-item";
    const date = post.timestamp
      ? new Date(post.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "-";

    item.innerHTML = `
      <div>
        <div class="admin-post-title">${escapeHTML(post.title)}</div>
        <div class="admin-post-date">${escapeHTML(post.category || "Geopolitics")} &nbsp;·&nbsp; ${date}${post.author ? " &nbsp;·&nbsp; By " + escapeHTML(post.author) : ""}</div>
      </div>
      <button class="delete-btn" data-id="${post.id}">Delete</button>`;

    item.querySelector(".delete-btn").addEventListener("click", async function() {
      try {
        await deletePost(post.id);
      } catch (error) {
        console.error(error);
        const errMsg = document.getElementById("publish-error");
        if (errMsg) {
          errMsg.textContent = "Delete failed. Please try again.";
          errMsg.style.display = "block";
          setTimeout(() => { errMsg.style.display = "none"; }, 4000);
        }
      }
    });

    list.appendChild(item);
  });
}

async function deletePost(id) {
  await removePost(id);
  await Promise.all([renderPosts(), renderAdminPosts()]);
}

document.addEventListener("DOMContentLoaded", async function() {
  await renderPosts();
  initContactForm();
  initVolunteerForm();
  initAdmin();
  initPublishForm();
});
