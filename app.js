// ---------- FORE-Bot polished app.js (Master Harsh) ----------
// Sub-folder safe. Works with your existing index.html/manifest/sw.js.

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

// Personalization
const MASTER = "Master Harsh";
const OWNER  = { name: "Harsh Dubey", roll: "055086" };

// Data
const DATA = {
  owner: OWNER,
  sections: ["AIB-1G","GAIBA-G","ABM-1G","STCI-2G","SDRM-2G"],
  faculty: {
    "AIB-1G":  "Prof. Vaibhav Jain (VF)",
    "GAIBA-G": "Prof. Anuj Saini (VF)",
    "ABM-1G":  "Prof. Rahul Gupta (VF)",
    "STCI-2G": "Prof. Anil Kumar Singh",
    "SDRM-2G": "Prof. Pranesh Nagarajan"
  },
  // Weeks 7–11 from your timetable (only your sections)
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

// ---------- helpers ----------
const el = (s)=>document.querySelector(s);
const messages = el('#messages');
const text = el('#text');

// say as rich HTML (for nice formatting)
function sayHTML(html){
  const b=document.createElement('div');
  b.className='bubble me';
  b.innerHTML=html;
  messages.appendChild(b);
  messages.scrollTop = messages.scrollHeight;
}
function sayUser(content){
  const b=document.createElement('div');
  b.className='bubble you';
  b.textContent=content;
  messages.appendChild(b);
  messages.scrollTop = messages.scrollHeight;
}
function minutesDiff(a,b){ return Math.round((b-a)/60000); }
function toLocal(dateStr,timeStr){
  const [y,m,d]=dateStr.split('-').map(Number);
  const [H,M]=timeStr.split(':').map(Number);
  return new Date(y,m-1,d,H,M,0);
}
function fmtDate(d){ // Sat, 16 Aug 2025
  const wk=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${wk[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')} ${mo[d.getMonth()]} ${d.getFullYear()}`;
}
function nextEvent(now=new Date()){
  return DATA.events.map(e=>({...e,startDate:toLocal(e.date,e.start)}))
    .filter(e=>e.startDate>now)
    .sort((a,b)=>a.startDate-b.startDate)[0]||null;
}
function eventsOnDate(dateStr){
  return DATA.events.filter(e=>e.date===dateStr)
    .sort((a,b)=>toLocal(a.date,a.start)-toLocal(b.date,b.start));
}
function calcGaps(evs){
  const gaps=[];
  for(let i=0;i<evs.length-1;i++){
    const end=toLocal(evs[i].date,evs[i].end);
    const start=toLocal(evs[i+1].date,evs[i+1].start);
    gaps.push(minutesDiff(end,start));
  }
  return gaps;
}
// --- Reminder settings (local) ---
const REMIND_OFFSETS_MIN = [15, 5];   // minutes before class
let reminderTimers = [];               // store setTimeout IDs

function clearReminders() {
  reminderTimers.forEach(id => clearTimeout(id));
  reminderTimers = [];
}

function eventsWithinNext(hours = 24) {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 3600_000);
  return DATA.events
    .map(e => ({ ...e, startDate: toLocal(e.date, e.start) }))
    .filter(e => e.startDate > now && e.startDate <= future)
    .sort((a, b) => a.startDate - b.startDate);
}

async function ensurePermission() {
  if (!('Notification' in window)) { alert('Notifications not supported.'); return false; }
  let perm = Notification.permission;
  if (perm !== 'granted') perm = await Notification.requestPermission();
  return perm === 'granted';
}

async function scheduleRemindersForNext24h() {
  if (!(await ensurePermission())) return;
  clearReminders();
  const upcoming = eventsWithinNext(24);
  upcoming.forEach(ev => {
    const start = toLocal(ev.date, ev.start).getTime();
    REMIND_OFFSETS_MIN.forEach(mins => {
      const t = start - mins * 60_000;
      const delay = t - Date.now();
      if (delay > 1000) {
        const id = setTimeout(() => {
          new Notification('Class reminder', {
            body: `${ev.section} with ${DATA.faculty[ev.section]} at ${ev.start} • ${ev.room} in ${mins} min, ${MASTER}.`
          });
        }, delay);
        reminderTimers.push(id);
      }
    });
  });
}

// Reschedule on app load and every hour (catches the new day)
window.addEventListener('load', () => scheduleRemindersForNext24h());
setInterval(() => scheduleRemindersForNext24h(), 60 * 60 * 1000);

// ---------- top card + countdown ----------
let target = nextEvent();
let timerId = null;

function renderNextCard(ev){
  const n = ev || nextEvent() ;
  const box = el('#nextInfo');
  if(!n){ box.textContent="No upcoming classes in data."; return null; }
  const d = toLocal(n.date, n.start);
  box.textContent = `${n.section} • ${DATA.faculty[n.section]} • ${n.date} ${n.start}-${n.end} • ${n.room}`;
  return n;
}
function startCountdown(ev){
  target = ev || target || nextEvent();
  if(!target){ sayHTML(`${MASTER}, I don't see an upcoming class.`); return; }
  if(timerId) clearInterval(timerId);
  timerId=setInterval(()=>{
    const now=new Date();
    const diff = toLocal(target.date,target.start) - now;
    if(diff<=0){ el('#countdown').textContent='Class is starting now!'; clearInterval(timerId); timerId=null; return; }
    const mins=Math.floor(diff/60000), secs=Math.floor((diff%60000)/1000);
    el('#countdown').textContent=`${mins}m ${secs}s`;
  },1000);
}
el('#startTimerBtn').addEventListener('click', ()=> startCountdown());
renderNextCard();

// ---------- notifications + theme ----------
el('#notifyBtn').addEventListener('click', async () => {
  const ok = await ensurePermission();
  if (!ok) return;
  await scheduleRemindersForNext24h();
  sayHTML(`🔔 I’ll remind you <b>15 min</b> (and <b>5 min</b>) before each class in the next 24h, <b>${MASTER}</b>. Keep the app open in the background for local alerts.`);
});

// auto theme: odd day = spidey, even = bat
(function autoTheme(){
  const day = new Date().getDate();
  document.body.classList.remove('bat','spidey');
  if(day%2===0) document.body.classList.add('bat'); else document.body.classList.add('spidey');
})();
el('#themeBtn').addEventListener('click', ()=>{
  document.body.classList.toggle('bat');
  document.body.classList.toggle('spidey');
});

// ---------- greeting ----------
sayHTML(`Welcome back, <b>${MASTER}</b>. I’m ready — ask for <i>next class</i>, a <i>date</i>, <i>faculty</i>, or <i>start timer</i>.`);

// ---------- parsing ----------
function parseDateQuery(q, now=new Date()){
  q=q.toLowerCase();
  if(/tomorrow/.test(q)){ const d=new Date(now); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); }
  if(/day after tomorrow/.test(q) || /after\s*2\s*days/.test(q)){ const d=new Date(now); d.setDate(d.getDate()+2); return d.toISOString().slice(0,10); }
  if(/today/.test(q)) return now.toISOString().slice(0,10);
  const ddmm=q.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if(ddmm){ const [_,dd,mm]=ddmm; const day=+dd, month=+mm; return `${now.getFullYear()}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`; }
  const iso=q.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if(iso) return iso[1];
  return null;
}

// ---------- quick chips ----------
function showChips(options){
  const wrap=document.createElement('div');
  wrap.className='chips';
  options.forEach(o=>{
    const b=document.createElement('button');
    b.type='button'; b.className='chip'; b.textContent=o.label;
    b.addEventListener('click', o.onClick);
    wrap.appendChild(b);
  });
  messages.appendChild(wrap);
  messages.scrollTop=messages.scrollHeight;
}

// ---------- chat ----------
document.getElementById('composer').addEventListener('submit',(e)=>{
  e.preventDefault();
  const q=text.value.trim(); if(!q) return;
  sayUser(q);
  text.value='';

  const now = new Date();
  const n   = nextEvent(now);
  const Q   = q.toUpperCase();

  // ok
  if(/^(ok|okay|fine|sure|alright)$/i.test(q)){ sayHTML(`Thanks, let me know if you need any more help, <b>${MASTER}</b>.`); return; }

  // theme commands
  if(/spider|spiderman mode/i.test(q)){ document.body.classList.remove('bat'); document.body.classList.add('spidey'); sayHTML(`🕷️ Spidey mode on, <b>${MASTER}</b>.`); return; }
  if(/bat|batman mode/i.test(q))     { document.body.classList.remove('spidey'); document.body.classList.add('bat'); sayHTML(`🦇 Bat mode on, <b>${MASTER}</b>.`); return; }

  // next class
  if(/next class|upcoming/i.test(q)){
    if(!n){ sayHTML(`${MASTER}, no next class found.`); return; }
    const mins = minutesDiff(now, toLocal(n.date,n.start));
    const d    = toLocal(n.date,n.start);
    sayHTML(`📅 <b>${fmtDate(d)}</b><br><b>${n.section}</b> with <i>${DATA.faculty[n.section]}</i><br>⏳ ${n.start}–${n.end} &nbsp; 🏫 ${n.room}<br><small>Starts in <b>${mins} min</b>.</small>`);
    renderNextCard(n); // refresh top card to this
    showChips([
  {label:'Yes, start timer', onClick:()=>{ startCountdown(n); sayHTML('⏱️ Timer started.'); }},
  {label:'Remind me (15m/5m)', onClick:()=>{ scheduleRemindersForNext24h(); sayHTML('🔔 Reminder set for your upcoming classes.'); }},
  {label:'No, thanks', onClick:()=>{ sayHTML('Okay, I’ll be here if you need me, <b>'+MASTER+'</b>.'); }}
]);

    return;
  }

  // date query
  const wanted = parseDateQuery(q, now);
  if(wanted){
    const evs = eventsOnDate(wanted);
    const d   = toLocal(wanted, "00:00");
    if(!evs.length){ sayHTML(`No classes found for <b>${fmtDate(d)}</b>, <b>${MASTER}</b>.`); return; }
    sayHTML(`📅 <b>${fmtDate(d)}</b> — classes:`);
    evs.forEach(ev=>{
      sayHTML(`<b>${ev.section}</b> with <i>${DATA.faculty[ev.section]}</i><br>⏳ ${ev.start}–${ev.end} &nbsp; 🏫 ${ev.room}`);
    });
    // gaps
    const gaps=calcGaps(evs);
    if(gaps.length){ 
      const nice = gaps.map(m=> (m>=60? `${Math.floor(m/60)}h ${m%60}m` : `${m}m`) ).join(', ');
      sayHTML(`Breaks between classes: <b>${nice}</b>.`);
    }
    // also refresh the top card to first class of that day
    renderNextCard(evs[0]);
    return;
  }

  // faculty query
  if(/faculty|professor|teacher/i.test(q)){
    const sec = DATA.sections.find(s=> Q.includes(s));
    if(sec) sayHTML(`<b>${sec}</b>: <i>${DATA.faculty[sec]}</i>`);
    else sayHTML(Object.entries(DATA.faculty).map(([k,v])=>`<b>${k}</b>: <i>${v}</i>`).join('<br>'));
    return;
  }

  // time for a section
  if(/time for/i.test(q)){
    const sec = DATA.sections.find(s=> Q.includes(s));
    if(sec){
      const today = DATA.events.filter(e=>e.section===sec).sort((a,b)=> toLocal(a.date,a.start)-toLocal(b.date,b.start));
      if(today.length){
        const ev=today[0];
        sayHTML(`<b>${sec}</b>: ${ev.date} • ⏳ ${ev.start}–${ev.end} • 🏫 ${ev.room}`);
        renderNextCard(ev);
      }else sayHTML(`No timing found for <b>${sec}</b>, ${MASTER}.`);
    }else{
      sayHTML(`Tell me which section, ${MASTER} (e.g., <i>time for GAIBA-G</i>).`);
    }
    return;
  }

  // default help
  sayHTML(`I can tell you <b>next class</b>, start a <b>timer</b>, list <b>faculty</b>, show <b>timings</b>, or find classes for a <b>specific date</b>, ${MASTER}.`);
});

// uploads (placeholder)
document.getElementById('uploadBtn').addEventListener('click', ()=> document.getElementById('file').click());
document.getElementById('file').addEventListener('change', (e)=>{
  sayHTML(`Loaded <b>${e.target.files.length}</b> image(s), ${MASTER}.`);
});
