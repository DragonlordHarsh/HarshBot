// --- FORE-Bot (Master Harsh) — full app.js ---
// Works from a GitHub Pages sub-folder (e.g., /FORE-Bot/)
// Requires: index.html, style.css, manifest.json, sw.js already set for sub-folder hosting.

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

// Personalization
const MASTER_NAME = "Master Harsh";
const OWNER = { name: "Harsh Dubey", roll: "055086" };

// Data (only your 5 sections)
const DATA = {
  owner: OWNER,
  sections: ["AIB-1G", "GAIBA-G", "ABM-1G", "STCI-2G", "SDRM-2G"],
  faculty: {
    "AIB-1G": "Prof. Vaibhav Jain (VF)",
    "GAIBA-G": "Prof. Anuj Saini (VF)",
    "ABM-1G": "Prof. Rahul Gupta (VF)",
    "STCI-2G": "Prof. Anil Kumar Singh",
    "SDRM-2G": "Prof. Pranesh Nagarajan"
  },
  // Weeks 7–11 only, from your timetable (pages 1–5)
  events: [
    // Week 7
    { date: "2025-08-11", start: "16:30", end: "17:45", section: "AIB-1G",  room: "CR-3" },
    { date: "2025-08-13", start: "11:25", end: "12:40", section: "GAIBA-G", room: "CR-5" },
    { date: "2025-08-13", start: "16:30", end: "17:45", section: "STCI-2G", room: "CR-4" },
    { date: "2025-08-16", start: "12:50", end: "14:05", section: "ABM-1G",  room: "CR-4" },

    // Week 8
    { date: "2025-08-18", start: "08:30", end: "09:45", section: "ABM-1G",  room: "CR-4" },
    { date: "2025-08-18", start: "12:50", end: "14:05", section: "AIB-1G",  room: "CR-3" },
    { date: "2025-08-19", start: "12:50", end: "14:05", section: "GAIBA-G", room: "CR-5" },
    { date: "2025-08-19", start: "18:00", end: "19:15", section: "STCI-2G", room: "CR-4" },
    { date: "2025-08-20", start: "10:00", end: "11:15", section: "SDRM-2G", room: "CR-4" },
    { date: "2025-08-22", start: "12:50", end: "14:05", section: "SDRM-2G", room: "CR-4" },
    { date: "2025-08-24", start: "10:00", end: "11:15", section: "STCI-2G", room: "CR-4" },

    // Week 9
    { date: "2025-08-27", start: "11:25", end: "12:40", section: "GAIBA-G", room: "CR-5" },
    { date: "2025-08-27", start: "15:00", end: "16:15", section: "STCI-2G", room: "CR-4" },
    { date: "2025-08-29", start: "12:50", end: "14:05", section: "AIB-1G",  room: "CR-3" },
    { date: "2025-08-31", start: "08:30", end: "09:45", section: "STCI-2G", room: "CR-4" },

    // Week 10
    { date: "2025-09-01", start: "15:00", end: "16:15", section: "STCI-2G", room: "CR-4" },
    { date: "2025-09-02", start: "11:25", end: "12:40", section: "GAIBA-G", room: "CR-5" },
    { date: "2025-09-03", start: "11:25", end: "12:40", section: "SDRM-2G", room: "CR-4" },
    { date: "2025-09-06", start: "10:00", end: "11:15", section: "AIB-1G",  room: "CR-3" },
    { date: "2025-09-06", start: "15:00", end: "16:15", section: "ABM-1G",  room: "CR-4" },

    // Week 11
    { date: "2025-09-09", start: "11:25", end: "12:40", section: "GAIBA-G", room: "CR-5" },
    { date: "2025-09-11", start: "12:50", end: "14:05", section: "SDRM-2G", room: "CR-4" },
    { date: "2025-09-13", start: "10:00", end: "11:15", section: "AIB-1G",  room: "CR-3" },
    { date: "2025-09-13", start: "16:30", end: "17:45", section: "ABM-1G",  room: "CR-4" }
  ]
};

// --- DOM helpers
const el = (s) => document.querySelector(s);
const messages = el('#messages');
const text = el('#text');

// --- Say
function say(content, who = 'me') {
  const b = document.createElement('div');
  b.className = 'bubble ' + (who === 'you' ? 'you' : 'me');
  b.textContent = content;
  messages.appendChild(b);
  messages.scrollTop = messages.scrollHeight;
}

// --- Time helpers
function minutesDiff(a, b) { return Math.round((b - a) / 60000); }
function toLocal(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [H, M] = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, H, M, 0);
}
function nextEvent(now = new Date()) {
  return DATA.events
    .map(e => ({ ...e, startDate: toLocal(e.date, e.start) }))
    .filter(e => e.startDate > now)
    .sort((a, b) => a.startDate - b.startDate)[0] || null;
}
function eventsOnDate(targetDate) {
  return DATA.events
    .filter(e => e.date === targetDate)
    .sort((a, b) => toLocal(a.date, a.start) - toLocal(b.date, b.start));
}

// --- Next card + countdown
let target = nextEvent();
let timerId = null;
function startCountdown(ev) {
  target = ev || target || nextEvent();
  if (!target) { say(`${MASTER_NAME}, I don't see an upcoming class.`); return; }
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    const now = new Date();
    const start = toLocal(target.date, target.start);
    const diff = start - now;
    if (diff <= 0) {
      el('#countdown').textContent = 'Class is starting now!';
      clearInterval(timerId); timerId = null; return;
    }
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    el('#countdown').textContent = `${mins}m ${secs}s`;
  }, 1000);
}
function renderNextCard() {
  const n = nextEvent();
  const box = el('#nextInfo');
  if (!n) { box.textContent = "No upcoming classes in data."; return null; }
  box.textContent = `${n.section} • ${DATA.faculty[n.section]} • ${n.date} ${n.start}-${n.end} • ${n.room}`;
  return n;
}
el('#startTimerBtn').addEventListener('click', () => startCountdown());
renderNextCard(); // initial

// --- Notifications
el('#notifyBtn').addEventListener('click', async () => {
  if (!('Notification' in window)) { alert('Notifications not supported.'); return; }
  let perm = Notification.permission;
  if (perm !== 'granted') perm = await Notification.requestPermission();
  if (perm === 'granted') new Notification('FORE-Bot', { body: `Howdy, ${MASTER_NAME}! Notifications are ready.` });
});

// --- Theme: auto set and manual switch
function applyAutoTheme() {
  const day = new Date().getDate();
  document.body.classList.remove('bat', 'spidey');
  if (day % 2 === 0) document.body.classList.add('bat'); else document.body.classList.add('spidey');
}
applyAutoTheme();
el('#themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('bat');
  document.body.classList.toggle('spidey');
});

// --- Greeting
say(`Howdy, ${MASTER_NAME}! Ask me about your next class, a date, faculty, or to start a timer.`);

// --- Parser: dd/mm, ISO, relative
function parseDateQuery(q, now = new Date()) {
  q = q.toLowerCase();

  if (/tomorrow/.test(q)) {
    const d = new Date(now); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (/day after tomorrow/.test(q) || /after\s*2\s*days/.test(q)) {
    const d = new Date(now); d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }
  if (/today/.test(q)) {
    return now.toISOString().slice(0, 10);
  }
  const ddmm = q.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (ddmm) {
    const day = Number(ddmm[1]), month = Number(ddmm[2]);
    return `${now.getFullYear()}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  }
  const iso = q.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];

  return null;
}

// --- Chat handler
document.getElementById('composer').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = text.value.trim();
  if (!q) return;
  say(q, 'you');
  text.value = '';

  const now = new Date();
  const n = nextEvent(now);
  const Q = q.toUpperCase();

  // OK / confirmation
  if (/^(ok|okay|fine|sure|alright)$/i.test(q)) { say("Thanks, let me know if you need any more help, " + MASTER_NAME + "."); return; }

  // Theme commands
  if (/spider|spiderman mode/i.test(q)) { document.body.classList.remove('bat'); document.body.classList.add('spidey'); say("Spidey mode on, " + MASTER_NAME + "."); return; }
  if (/bat|batman mode/i.test(q))      { document.body.classList.remove('spidey'); document.body.classList.add('bat'); say("Bat mode on, " + MASTER_NAME + "."); return; }

  // Next class
  if (/next class|upcoming/i.test(q)) {
    if (!n) { say(`${MASTER_NAME}, no next class found.`); return; }
    const mins = minutesDiff(now, toLocal(n.date, n.start));
    say(`Your next class is ${n.section} in ${n.room} at ${n.start} on ${n.date} with ${DATA.faculty[n.section]}. That’s in ${mins} minutes. Shall I start a timer, ${MASTER_NAME}?`);
    target = n;
    return;
  }

  // Date queries
  const wanted = parseDateQuery(q, now);
  if (wanted) {
    const evs = eventsOnDate(wanted);
    if (!evs.length) say(`No classes found for ${wanted}, ${MASTER_NAME}.`);
    else {
      say(`Classes on ${wanted}, ${MASTER_NAME}:`);
      evs.forEach(ev => say(`${ev.section} • ${DATA.faculty[ev.section]} • ${ev.start}-${ev.end} • ${ev.room}`));
    }
    return;
  }

  // Faculty query
  if (/faculty|professor|teacher/i.test(q)) {
    const sec = DATA.sections.find(s => Q.includes(s));
    if (sec) say(`${sec}: ${DATA.faculty[sec]}`);
    else say(Object.entries(DATA.faculty).map(([k,v]) => `${k}: ${v}`).join('\n'));
    return;
  }

  // Time query for a section
  if (/time for/i.test(q)) {
    const sec = DATA.sections.find(s => Q.includes(s));
    if (sec) {
      const ev = DATA.events.find(e => e.section === sec); // first matching entry
      if (ev) say(`${ev.date} ${ev.start}-${ev.end}`);
      else say(`No timing found for ${sec}, ${MASTER_NAME}.`);
    } else {
      say(`Tell me which section, ${MASTER_NAME} (e.g., "time for GAIBA-G").`);
    }
    return;
  }

  // Default help
  say(`I can tell you next class, start a timer, list faculty, show timings, or find classes for a specific date, ${MASTER_NAME}.`);
});

// File upload placeholder
document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('file').click());
document.getElementById('file').addEventListener('change', (e) => {
  say(`Loaded ${e.target.files.length} image(s), ${MASTER_NAME}.`);
});
