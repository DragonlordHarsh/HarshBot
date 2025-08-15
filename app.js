if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

// ---- Personalization ----
const DATA = {
  owner: { name: "Harsh Dubey", roll: "055086" },
  sections: ["AIB-1G","GAIBA-G","ABM-1G","STCI-2G","SDRM-2G"],
  faculty: {
    "AIB-1G": "Prof. Vaibhav Jain (VF)",
    "GAIBA-G": "Prof. Anuj Saini (VF)",
    "ABM-1G": "Prof. Rahul Gupta (VF)",
    "STCI-2G": "Prof. Anil Kumar Singh",
    "SDRM-2G": "Prof. Pranesh Nagarajan"
  },

  // ---- ONLY your classes (weeks 7–11) ----
  // Dates are YYYY-MM-DD (India time). Update if your institute changes any slot.
  events: [
    // Week 7
    { date:"2025-08-11", start:"16:30", end:"17:45", section:"AIB-1G",  room:"CR-3" },
    { date:"2025-08-13", start:"11:25", end:"12:40", section:"GAIBA-G", room:"CR-5" },
    { date:"2025-08-13", start:"16:30", end:"17:45", section:"STCI-2G", room:"CR-4" },
    { date:"2025-08-16", start:"12:50", end:"14:05", section:"ABM-1G",  room:"CR-4" },

    // Week 8
    { date:"2025-08-18", start:"08:30", end:"09:45", section:"ABM-1G",  room:"CR-4" },
    { date:"2025-08-18", start:"12:50", end:"14:05", section:"AIB-1G",  room:"CR-3" },
    { date:"2025-08-19", start:"12:50", end:"14:05", section:"GAIBA-G", room:"CR-5" },
    { date:"2025-08-19", start:"18:00", end:"19:15", section:"STCI-2G", room:"CR-4" },
    { date:"2025-08-20", start:"10:00", end:"11:15", section:"SDRM-2G", room:"CR-4" },
    { date:"2025-08-22", start:"12:50", end:"14:05", section:"SDRM-2G", room:"CR-4" },
    { date:"2025-08-24", start:"10:00", end:"11:15", section:"STCI-2G", room:"CR-4" },

    // Week 9
    { date:"2025-08-27", start:"11:25", end:"12:40", section:"GAIBA-G", room:"CR-5" },
    { date:"2025-08-27", start:"15:00", end:"16:15", section:"STCI-2G", room:"CR-4" },
    { date:"2025-08-29", start:"12:50", end:"14:05", section:"AIB-1G",  room:"CR-3" },
    { date:"2025-08-31", start:"08:30", end:"09:45", section:"STCI-2G", room:"CR-4" },

    // Week 10
    { date:"2025-09-01", start:"15:00", end:"16:15", section:"STCI-2G", room:"CR-4" },
    { date:"2025-09-02", start:"11:25", end:"12:40", section:"GAIBA-G", room:"CR-5" },
    { date:"2025-09-03", start:"11:25", end:"12:40", section:"SDRM-2G", room:"CR-4" },
    { date:"2025-09-06", start:"10:00", end:"11:15", section:"AIB-1G",  room:"CR-3" },
    { date:"2025-09-06", start:"15:00", end:"16:15", section:"ABM-1G",  room:"CR-4" },

    // Week 11
    { date:"2025-09-09", start:"11:25", end:"12:40", section:"GAIBA-G", room:"CR-5" },
    { date:"2025-09-11", start:"12:50", end:"14:05", section:"SDRM-2G", room:"CR-4" },
    { date:"2025-09-13", start:"10:00", end:"11:15", section:"AIB-1G",  room:"CR-3" },
    { date:"2025-09-13", start:"16:30", end:"17:45", section:"ABM-1G",  room:"CR-4" }
  ]
};

// ---------- UI helpers ----------
const el = s => document.querySelector(s);
const messages = el('#messages');
const text = el('#text');

function say(content, who='me'){
  const b = document.createElement('div');
  b.className = 'bubble ' + (who==='you' ? 'you' : 'me');
  b.textContent = content;
  messages.appendChild(b);
  messages.scrollTop = messages.scrollHeight;
}

function minutesDiff(a,b){ return Math.round((b-a)/60000); }
function toLocal(dateStr, timeStr){
  const [y,m,d] = dateStr.split('-').map(Number);
  const [H,M] = timeStr.split(':').map(Number);
  return new Date(y, m-1, d, H, M, 0);
}
function nextEvent(now=new Date()){
  return DATA.events
    .map(e => ({...e, startDate: toLocal(e.date, e.start)}))
    .filter(e => e.startDate > now)
    .sort((a,b) => a.startDate - b.startDate)[0] || null;
}
function eventsOnDate(targetDate){
  return DATA.events
    .filter(e => e.date === targetDate)
    .sort((a,b) => toLocal(a.date,a.start) - toLocal(b.date,b.start));
}

// ---------- Countdown / Notifications / Theme ----------
let target = nextEvent();
let timerId = null;

function startCountdown(ev){
  target = ev || target || nextEvent();
  if (!target) { say("Master Harsh, I don't see an upcoming class."); return; }
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

el('#startTimerBtn')?.addEventListener('click', () => startCountdown());

el('#notifyBtn')?.addEventListener('click', async () => {
  if (!('Notification' in window)) { alert('Notifications not supported.'); return; }
  let perm = Notification.permission;
  if (perm !== 'granted') perm = await Notification.requestPermission();
  if (perm === 'granted') new Notification('FORE-Bot', { body: 'Howdy, Master Harsh! Notifications are ready.' });
});

(function autoTheme(){
  const day = new Date().getDate();
  document.body.classList.toggle('bat', day % 2 === 0);
  document.body.classList.toggle('spidey', day % 2 === 1);
})();
el('#themeBtn')?.addEventListener('click', () => {
  document.body.classList.toggle('bat');
  document.body.classList.toggle('spidey');
});

// ---------- Greeting ----------
say("Howdy, Master Harsh! Ask me about your next class, a date, faculty, or to start a timer.");

// ---------- Chat logic ----------
document.getElementById('composer')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = (text.value || '').trim();
  if (!q) return;
  say(q, 'you');
  text.value = '';

  const now = new Date();
  const n = nextEvent(now);

  // OK / Okay response
  if (/^(ok|okay|fine|sure|alright)$/i.test(q)) {
    say("Thanks, let me know if you need any more help, Master Harsh.");
    return;
  }

  // Next class
  if (/next class|upcoming/i.test(q)) {
    if (!n) { say("Master Harsh, no next class found."); return; }
    const mins = minutesDiff(now, toLocal(n.date, n.start));
    say(`Your next class is ${n.section} in ${n.room} at ${n.start} on ${n.date} with ${DATA.faculty[n.section]}. That’s in ${mins} minutes. Shall I start a timer, Master Harsh?`);
    return;
  }

  // Date queries: today, tomorrow, day-after, dd/mm, ISO
  let dateMatch = null;
  if (/today/i.test(q)) {
    dateMatch = now.toISOString().slice(0,10);
  } else if (/tomorrow/i.test(q)) {
    const d = new Date(now); d.setDate(d.getDate()+1);
    dateMatch = d.toISOString().slice(0,10);
  } else if (/day after tomorrow|after 2 days/i.test(q)) {
    const d = new Date(now); d.setDate(d.getDate()+2);
    dateMatch = d.toISOString().slice(0,10);
  } else if (/\b\d{1,2}\/\d{1,2}\b/.test(q)) {
    const nums = q.match(/\d+/g).map(Number);
    if (nums.length >= 2) {
      const [day, month] = nums;
      dateMatch = `${now.getFullYear()}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }
  } else if (/\d{4}-\d{2}-\d{2}/.test(q)) {
    dateMatch = q.match(/\d{4}-\d{2}-\d{2}/)[0];
  }

  if (dateMatch) {
    const evs = eventsOnDate(dateMatch);
    if (!evs.length) {
      say(`No classes found for ${dateMatch}, Master Harsh.`);
    } else {
      say(`Classes on ${dateMatch}, Master Harsh:`);
      evs.forEach(ev => say(`${ev.section} • ${DATA.faculty[ev.section]} • ${ev.start}-${ev.end} • ${ev.room}`));
    }
    return;
  }

  // Faculty query
  if (/faculty|professor|teacher/i.test(q)) {
    const sec = DATA.sections.find(s => q.toUpperCase().includes(s));
    if (sec) say(`${sec}: ${DATA.faculty[sec]}`);
    else say(Object.entries(DATA.faculty).map(([k,v])=>`${k}: ${v}`).join('\n'));
    return;
  }

  // Time for specific section (first matching occurrence)
  if (/time for/i.test(q)) {
    const sec = DATA.sections.find(s => q.toUpperCase().includes(s));
    if (sec) {
      const ev = DATA.events.find(ev => ev.section === sec);
      if (ev) say(`${ev.date} ${ev.start}-${ev.end}`);
      else say(`No timing found for ${sec}, Master Harsh.`);
    }
    return;
  }

  say("I can tell you next class, faculty, timings, or classes for a specific date, Master Harsh.");
});

// Image upload (placeholder)
document.getElementById('uploadBtn')?.addEventListener('click', () => document.getElementById('file').click());
document.getElementById('file')?.addEventListener('change', (e) => {
  say(`Loaded ${e.target.files.length} image(s), Master Harsh.`);
});
