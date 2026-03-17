# Veil of Veritas

Static site for Veil of Veritas with:

- homepage and dedicated blog archive
- admin panel
- Netlify Function for shared blog post storage

## Netlify deploy

Import this folder from GitHub into Netlify.

Use these settings:

- Build command: leave blank
- Publish directory: `.`
- Functions directory: `netlify/functions`

`netlify.toml` is already included, so Netlify should pick this up automatically.

## Important

The blog publishing flow depends on the Netlify Function in:

- `netlify/functions/posts.js`

That means this project should be deployed through Git-connected Netlify deployment so the function and dependency install are built properly.
