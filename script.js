// Basic interactive bits and API hookup
document.getElementById('year').textContent = new Date().getFullYear();

// mobile nav toggle
document.querySelector('.nav-toggle').addEventListener('click', ()=>{
  const n = document.querySelector('.nav');
  n.style.display = (n.style.display === 'flex') ? 'none' : 'flex';
});

// contact form post (by default POSTS to your Cloudflare Worker API if you set WORKER_API_URL in this file)
const WORKER_API_URL = ''; // <-- set your worker endpoint, e.g. "https://afnan-portfolio-api.mdafnahossan1.workers.dev"
const ADMIN_PASSWORD_HEADER = ''; // optional if your messages endpoint requires admin password (leave blank for public messages)

const form = document.getElementById('contact-form');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const statusEl = document.getElementById('form-status');
  statusEl.textContent = 'Sending...';

  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };

  if (!WORKER_API_URL){
    statusEl.textContent = 'No API configured. Message will not be sent. Configure WORKER_API_URL in script.js.';
    return;
  }

  try {
    const res = await fetch(WORKER_API_URL + '/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': ADMIN_PASSWORD_HEADER
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (res.ok) {
      statusEl.textContent = 'Message sent — thanks!';
      form.reset();
    } else {
      statusEl.textContent = json && json.error ? 'Error: ' + json.error : 'Failed to send';
    }
  } catch (err){
    statusEl.textContent = 'Network error: ' + err.message;
  }
});

// Projects auto-load (if your API exists)
async function loadProjects(){
  const list = document.getElementById('projects-list');
  if (!list) return;
  const url = WORKER_API_URL ? (WORKER_API_URL + '/api/projects') : null;
  if (!url) return;
  try {
    const r = await fetch(url);
    if (!r.ok) return;
    const j = await r.json();
    if (!j || !j.results) return;
    list.innerHTML = '';
    j.results.forEach(p => {
      const a = document.createElement('article');
      a.className = 'card';
      a.innerHTML = `<h3>${escapeHtml(p.title||'Untitled')}</h3><p>${escapeHtml(p.description||'')}</p><a class="link" href="${escapeHtml(p.link||'#')}" target="_blank">View</a>`;
      list.appendChild(a);
    })
  } catch (e){
    console.log('projects load failed', e);
  }
}
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
loadProjects();