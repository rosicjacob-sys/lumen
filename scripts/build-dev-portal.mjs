#!/usr/bin/env node
// Build the /dev developer portal INTO dist/ after `vite build`.
//
// Runs on every Render deploy, so what developers download is always generated
// from the exact commit that produced the live site — the zip can never drift
// out of sync with the page.
//
// Produces:
//   dist/dev/index.html   the portal (Guide | Live site | Downloads)
//   dist/dev/source.zip   this repo's source at this commit (no node_modules/dist/.git)
//   dist/dev/*.pdf|.html|.md   the handoff + master guide (from ./docs)
// and injects a floating "Developer" button into dist/index.html.
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, copyFileSync, createWriteStream, statSync } from 'node:fs'
import { join, resolve, relative, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import archiver from 'archiver'

const ROOT = resolve(process.cwd())
const DIST = join(ROOT, 'dist')
const DEV = join(DIST, 'dev')
const DOCS = join(ROOT, 'docs')

const meta = JSON.parse(readFileSync(join(ROOT, 'delivery.json'), 'utf8'))

if (!existsSync(DIST)) {
  console.error('[dev-portal] dist/ missing — run the vite build first')
  process.exit(1)
}
mkdirSync(DEV, { recursive: true })

// ---------- commit stamp (so the portal shows what's deployed) ----------
// execFile with an arg array (no shell) — nothing here is user-controlled anyway
const gitHead = () => {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return 'unknown' }
}
const commit = (process.env.RENDER_GIT_COMMIT || gitHead()).slice(0, 7)
const builtAt = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'

// ---------- copy docs ----------
let docFiles = []
if (existsSync(DOCS)) {
  docFiles = readdirSync(DOCS).filter((f) => !f.startsWith('.'))
  for (const f of docFiles) copyFileSync(join(DOCS, f), join(DEV, f))
}
const has = (f) => docFiles.includes(f)

// ---------- zip the source at this commit ----------
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git', '.vite', '.cache', '.DS_Store'])
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (EXCLUDE_DIRS.has(name) || name === '.DS_Store') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

await new Promise((res, rej) => {
  const out = createWriteStream(join(DEV, 'source.zip'))
  const zip = archiver('zip', { zlib: { level: 9 } })
  out.on('close', res)
  zip.on('error', rej)
  zip.pipe(out)
  const top = meta.slug + '/'
  for (const f of walk(ROOT)) {
    zip.file(f, { name: top + relative(ROOT, f).split(sep).join('/') })
  }
  zip.finalize()
})
const zipKB = Math.round(statSync(join(DEV, 'source.zip')).size / 1024)

// ---------- the portal page ----------
const row = (href, icon, title, sub, cta = 'Open →', extra = '') =>
  `<a class="row" href="${href}"${extra}><span class="ic">${icon}</span><div class="m"><b>${title}</b><span>${sub}</span></div><span class="go">${cta}</span></a>`

const downloads = [
  row('/dev/source.zip', '📦', 'Source code (.zip)', `Rebuilt on every deploy — always matches this page · ${zipKB} KB`, 'Download →'),
  has('HANDOFF.pdf') ? row('/dev/HANDOFF.pdf', '📄', "This theme's handoff (PDF)", 'Stack, entry points, signature animation file') : '',
  has('DEVELOPER-GUIDE.pdf') ? row('/dev/DEVELOPER-GUIDE.pdf', '📘', 'Full developer guide (PDF)', 'Shopify integration paths + what to replace') : '',
  has('DEVELOPER-GUIDE.html') ? row('/dev/DEVELOPER-GUIDE.html', '🌐', 'Full developer guide (web)', 'Read the master guide in the browser', 'Open →', ' target="_blank"') : '',
  row('/', '▶', 'Open the live site (full window)', 'The running theme — analyse it directly'),
].filter(Boolean).join('\n      ')

const portal = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>${meta.emoji} ${meta.title} — developer portal</title>
<style>
 *{box-sizing:border-box} html,body{height:100%} body{margin:0;background:#070a0f;color:#e8f0f6;
   font-family:ui-sans-serif,-apple-system,"Segoe UI",Inter,system-ui,sans-serif;display:flex;flex-direction:column;height:100vh}
 header{display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid #1c2a38;flex:0 0 auto;flex-wrap:wrap}
 .em{font-size:22px} .ttl{font-weight:700} .sub{color:#7c93a6;font-size:12px}
 .tabs{margin-left:auto;display:flex;gap:8px}
 .tab{padding:9px 16px;border:1px solid #1c2a38;border-radius:9px;background:#0e141c;color:#c9d4e6;font-size:13px;font-weight:600;cursor:pointer}
 .tab.on{background:#2e9be6;color:#05080c;border-color:#2e9be6}
 .tab.live{color:#34d98a;border-color:#1c3a2a} .tab.live.on{background:#34d98a;color:#05140c}
 main{flex:1;position:relative;overflow:hidden}
 .pane{position:absolute;inset:0;display:none} .pane.on{display:block}
 iframe{width:100%;height:100%;border:0;background:#fff}
 .live iframe{background:#070a0f}
 .dl{padding:40px 24px;max-width:720px;margin:0 auto;overflow:auto;height:100%}
 .dl h2{font-size:15px;color:#7c93a6;text-transform:uppercase;letter-spacing:.08em;margin:0 0 16px}
 .row{display:flex;align-items:center;gap:14px;padding:16px 18px;background:#0e141c;border:1px solid #1c2a38;border-radius:12px;text-decoration:none;color:#e8f0f6;margin-bottom:12px}
 .row:hover{border-color:#2e9be6}
 .ic{font-size:22px} .m{flex:1} .m b{display:block;font-size:14px} .m span{color:#7c93a6;font-size:12px}
 .go{color:#2e9be6;font-size:13px;font-weight:600}
 .note{margin-top:22px;color:#4a5a6c;font-size:12px;line-height:1.6}
 .stamp{font-family:ui-monospace,monospace;font-size:11px;color:#4a5a6c}
</style></head><body>
<header>
  <span class="em">${meta.emoji}</span>
  <div><div class="ttl">${meta.title}</div><div class="sub">Developer portal · <span class="stamp">build ${commit} · ${builtAt}</span></div></div>
  <div class="tabs">
    <button class="tab on" data-p="guide">📖 Guide</button>
    <button class="tab live" data-p="live">▶ Live site</button>
    <button class="tab" data-p="dl">⤓ Downloads</button>
  </div>
</header>
<main>
  <div class="pane on" data-p="guide"><iframe src="/dev/HANDOFF.html" title="Instructions"></iframe></div>
  <div class="pane live" data-p="live"><iframe src="/?embed=1" title="Live site"></iframe></div>
  <div class="pane" data-p="dl"><div class="dl">
      <h2>Downloads</h2>
      ${downloads}
      <p class="note">This link is scoped to <b>${meta.title}</b> only. The source zip is regenerated on every deploy from commit <span class="stamp">${commit}</span>, so it always matches what you see here. Prices/products in the live site are placeholders — see the guide, section 5.</p>
  </div></div>
</main>
<script>
 const tabs=[...document.querySelectorAll('.tab')],panes=[...document.querySelectorAll('.pane')];
 tabs.forEach(t=>t.onclick=()=>{const p=t.dataset.p;
   tabs.forEach(x=>x.classList.toggle('on',x.dataset.p===p));
   panes.forEach(x=>x.classList.toggle('on',x.dataset.p===p));});
</script></body></html>`
writeFileSync(join(DEV, 'index.html'), portal)

// ---------- inject the floating Developer button into the live page ----------
const BTN = `<a href="/dev/" id="__devbtn" style="position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#2e9be6;color:#05080c;font:600 13px/1 ui-sans-serif,-apple-system,system-ui,sans-serif;padding:11px 15px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.45);text-decoration:none">📖 Developer</a>
<script>if(new URLSearchParams(location.search).get('embed')==='1'){var b=document.getElementById('__devbtn');if(b)b.remove();}</script>`
const idx = join(DIST, 'index.html')
let html = readFileSync(idx, 'utf8')
if (!html.includes('__devbtn')) {
  html = html.includes('</body>') ? html.replace('</body>', BTN + '</body>') : html + BTN
  writeFileSync(idx, html)
}

console.log(`[dev-portal] ok — ${meta.title} · commit ${commit} · source.zip ${zipKB} KB · docs: ${docFiles.length}`)
