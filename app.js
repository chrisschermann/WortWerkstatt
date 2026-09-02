const lessons=(typeof EXERCISE_BANK!=="undefined"?EXERCISE_BANK:{});
const explain=[
["🎯","das / dass","Probe: Passt welches? Dann das. Passt nicht: dass."],
["🔤","s / ss / ß","Kurz → ss (wissen). Lang oder ei/au/eu → ß (Fuß, heiß)."],
["🔠","Großschreibung","Nomen groß. Auch: am Morgen, die Guten, beim Schwimmen."],
["〰️","Dehnung","Langes i oft ie. Manche Wörter mit h: wohnen, Stuhl."],
["🧱","Doppelkonsonant","Nach kurzem Vokal oft Doppelbuchstabe. k→ck, z→tz."],
["🔁","eu / äu","Ableiten: Traum → Träume. Ohne au-Familie: heute, Freund."],
["🔎","Verlängern","Hund → Hunde, Weg → Wege, Wald → Wälder."],
["📚","Wortarten","Nomen nennen, Verben tun, Adjektive beschreiben."],
["🧩","Satzglieder","Wer oder was? Subjekt. Was geschieht? Prädikat. Wen oder was? Akkusativ."],
["⚖️","seit / seid","seid = Verb. seit = Zeit."],
["📊","als / wie","Ungleich: größer als. Gleich: so schnell wie."],
["🔄","wieder / wider","wieder = nochmals. wider = gegen."],
["✍️","Komma","Nebensatz mit Komma. Wörtliche Rede mit Anführungszeichen."]
];
const curriculum={1:"Laute, Silben, erste Wortarten.",2:"Nomen groß, Verlängern.",3:"Ableiten, verlängern, Silben.",4:"s-Laute, Dehnung, Doppelkonsonant.",5:"das/dass, Großschreibung, Tempus, Lesen.",6:"Satzglieder, Komma, verwechselbare Wörter.",7:"Regeln übertragen und begründen."};
let grade=+(localStorage.wwGrade||5);
if(![1,2,3,4,5,6,7].includes(grade))grade=5;
let cur=null,queue=[],qi=0;
let state=JSON.parse(localStorage.wwState||'{"stars":0,"right":0,"tries":0,"writing":0,"errors":{}}');
if(!state.errors)state.errors={};
function save(){localStorage.wwGrade=grade;localStorage.wwState=JSON.stringify(state);document.getElementById("gradeTag").textContent=grade+". Klasse";document.getElementById("starTag").textContent=(state.stars||0)+" XP";}
function go(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.getElementById(id).classList.add("active");const titles={home:"Training",learn:"Regeln",write:"Schreiben",curriculum:"Plan",adult:"Eltern",quiz:"Aufgabe"};document.getElementById("screenTitle").textContent=titles[id]||"WortWerkstatt";if(id==="home")renderHome();if(id==="learn")renderLearn();if(id==="adult")renderAdult();if(id==="curriculum")renderCurr();scrollTo(0,0);}
function renderHome(){grades.innerHTML=[4,5,6,7,1,2,3].map(g=>`<button class="${g===grade?"on":""}" onclick="setGrade(${g})">${g}</button>`).join("");const seen={};modules.innerHTML="";(lessons[grade]||[]).forEach(x=>{if(seen[x[0]])return;seen[x[0]]=1;const n=(lessons[grade]||[]).filter(y=>y[0]===x[0]).length;const d=document.createElement("div");d.className="row-card";d.innerHTML=`<div class="icon">${x[1]}</div><div><h3>${x[0]}</h3><p>${x[3]} · ${n} Aufgaben</p></div><button>Öffnen</button>`;d.querySelector("button").onclick=()=>startCategory(x[0]);modules.appendChild(d);});}
function setGrade(g){grade=g;queue=[];qi=0;save();renderHome();}
function shuffled(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startCategory(topic){queue=shuffled((lessons[grade]||[]).filter(x=>x[0]===topic));qi=0;if(queue[0])start(queue[0]);}
function syllabify(word){const w=String(word||"").replace(/[^A-Za-zÄÖÜäöüß]/g,"");if(w.length<=2)return w?[w]:[];const re=/(sch|ch|ck|tz|ei|ie|eu|äu|au|[aeiouäöüy]+|[^aeiouäöüy]+)/gi;const parts=w.match(re)||[w];const syl=[];let buf="";parts.forEach(p=>{buf+=p;if(/[aeiouäöüy]/i.test(p)){syl.push(buf);buf="";}});if(buf){if(syl.length)syl[syl.length-1]+=buf;else syl.push(buf);}return syl;}
function renderSyllables(el,text){if(!el)return;const word=String(text||"").split(/\s+/).pop()||"";el.innerHTML=syllabify(word).map(s=>`<b>${s}</b>`).join("");}
function start(x){cur=x;qTopic.textContent=x[0];strategyBadge.textContent=x[3];qText.textContent=x[4];help.textContent="Erst selbst. Danach der Trick.";renderSyllables(document.getElementById("syllableHint"),x[8]||"");choices.innerHTML="";result.className="result hide";(x[5]||[]).forEach((a,i)=>{const b=document.createElement("button");b.textContent=a;b.onclick=()=>answer(i);choices.appendChild(b);});go("quiz");}
function answer(i){state.tries++;document.querySelectorAll("#choices button").forEach(b=>b.disabled=true);if(i===cur[6]){state.right++;state.stars+=2;result.className="result";result.innerHTML=`<b>Stimmt.</b><p>${cur[7]}</p><button class="btn-primary" onclick="next()">Weiter</button>`;}else{state.errors[cur[3]]=(state.errors[cur[3]]||0)+1;result.className="result retry";result.innerHTML=`<b>Noch einmal.</b><p>${cur[7]}</p><button class="btn-ghost" onclick="retry()">Versuch</button>`;}help.textContent=cur[7];save();}
function retry(){document.querySelectorAll("#choices button").forEach(b=>b.disabled=false);result.className="result hide";}
function startAdaptive(){const all=[...(lessons[grade]||[])];all.sort(()=>Math.random()-0.5);all.sort((a,b)=>(state.errors[b[3]]||0)-(state.errors[a[3]]||0));queue=all.slice(0,8);qi=0;if(queue[0])start(queue[0]);}
function next(){if(queue.length&&qi<queue.length-1){qi++;start(queue[qi]);return;}const done=queue.length;queue=[];qi=0;go("home");if(done>1)setTimeout(()=>alert("Einheit fertig. "+done+" Aufgaben."),80);}
function speakText(text){if(!text||!speechSynthesis)return;const u=new SpeechSynthesisUtterance(text);u.lang="de-AT";u.rate=0.92;speechSynthesis.cancel();speechSynthesis.speak(u);}
function speak(){if(cur)speakText(cur[8]||cur[4]);}
function renderLearn(){learnGrid.innerHTML=explain.map(x=>`<div class="row-card"><div class="icon">${x[0]}</div><div><h3>${x[1]}</h3><p>${x[2]}</p></div></div>`).join("");}
function renderCurr(){currGrid.innerHTML=[4,5,6,7,1,2,3].map(g=>`<div class="row-card"><div class="icon">${g}</div><div><h3>${g}. Klasse</h3><p>${curriculum[g]}</p></div><button onclick="setGrade(${g});go('home')">Üben</button></div>`).join("");}
function renderAdult(){const p=state.tries?Math.round(state.right/state.tries*100):0;adultStats.innerHTML=`<p><b>Klasse</b> ${grade}</p><p><b>XP</b> ${state.stars}</p><p><b>Versuche</b> ${state.tries} · richtig ${state.right}</p><div class="meter"><i style="width:${p}%"></i></div><p>${p} %</p><p><b>Schreiben</b> ${state.writing||0}</p>`;const es=Object.entries(state.errors||{}).sort((a,b)=>b[1]-a[1]);weak.innerHTML=es.length?es.map(e=>`<p><b>${e[0]}</b> · ${e[1]}</p>`).join(""):"<p class='muted'>Noch keine Schwerpunkte.</p>";}
function resetAll(){if(confirm("Lokale Daten löschen?")){state={stars:0,right:0,tries:0,writing:0,errors:{}};save();renderAdult();}}
let trace="m",writeLevel="letters",ghostVisible=true;
const writeSets={letters:["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","M","S","Ä","Ö","Ü","ß"],joins:["an","au","ei","er","ie","sch","st","ch"],syllables:["schul","lern","schreib","freund","spiel"],words:["Schule","Freund","Straße","wissen","müssen","heute","Träume"],sentences:["Ich übe in Ruhe.","Das Team gewinnt.","Wir wissen, dass es geht."]};
function renderWriteButtons(){const vals=writeSets[writeLevel];writeBtns.innerHTML=`<div class="traceNav"><select id="traceSelect"></select><button onclick="stepTrace(-1)">Zurück</button><button onclick="stepTrace(1)">Weiter</button></div><div class="traceChoices">${vals.map((v,i)=>`<button data-i="${i}">${v}</button>`).join("")}</div>`;const sel=document.getElementById("traceSelect");vals.forEach((v,i)=>{const o=document.createElement("option");o.value=i;o.textContent=v;sel.appendChild(o);});sel.onchange=()=>setTrace(vals[+sel.value]);writeBtns.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>setTrace(vals[+b.dataset.i]));}
function stepTrace(d){const v=writeSets[writeLevel];let i=v.indexOf(trace);if(i<0)i=0;setTrace(v[(i+d+v.length)%v.length]);}
function setWriteLevel(l){writeLevel=l;renderWriteButtons();setTrace(writeSets[l][0]);}
function setTrace(s){trace=s;ghost.textContent=s;clearCanvas();const sel=document.getElementById("traceSelect");if(sel){const i=writeSets[writeLevel].indexOf(s);if(i>=0)sel.value=i;}writeBtns.querySelectorAll("[data-i]").forEach(b=>b.classList.toggle("active",writeSets[writeLevel][+b.dataset.i]===s));}
function toggleGhost(){ghostVisible=!ghostVisible;ghost.style.visibility=ghostVisible?"visible":"hidden";}
function sayTrace(){speakText(trace);}
function finishWriting(){state.writing++;state.stars++;save();alert("Gespeichert.");}
const c=document.getElementById("canvas"),ctx=c.getContext("2d");
let draw=false;
function xy(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return[(p.clientX-r.left)*c.width/r.width,(p.clientY-r.top)*c.height/r.height];}
function dn(e){draw=true;ctx.beginPath();ctx.moveTo(...xy(e));e.preventDefault();}
function mv(e){if(!draw)return;ctx.lineWidth=8;ctx.lineCap="round";ctx.strokeStyle="#1A1A1A";ctx.lineTo(...xy(e));ctx.stroke();e.preventDefault();}
function up(){draw=false;}
["mousedown","touchstart"].forEach(n=>c.addEventListener(n,dn,{passive:false}));
["mousemove","touchmove"].forEach(n=>c.addEventListener(n,mv,{passive:false}));
["mouseup","mouseleave","touchend"].forEach(n=>c.addEventListener(n,up));
function clearCanvas(){ctx.clearRect(0,0,c.width,c.height);}
save();renderHome();renderWriteButtons();
