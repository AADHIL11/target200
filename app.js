import{FaceDetector,FilesetResolver}from"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";
// ===== Edit demo accounts here =====
const ACCOUNTS={STU001:{password:"maths199",name:"Arun Kumar"},STU002:{password:"physics199",name:"Priya S."},STU003:{password:"chem199",name:"Karthik R."}};
const EXAM=new Date(2027,2,1),GOAL=10800,BLOCK=5400,BREAK=1800;
// ===== Syllabus: Subject|Chapter|topic;topic;... =====
const RAW=`Maths|1. Applications of Matrices and Determinants|Rank of a matrix;Consistency of linear equations;Cramer's rule;Gaussian elimination method
Maths|2. Complex Numbers|Rectangular form;Polar form;De Moivre's theorem;Roots of complex numbers
Maths|3. Theory of Equations|Polynomial roots;Relations between roots and coefficients;Descartes' rule of signs
Maths|4. Inverse Trigonometric Functions|Domain and range;Principal values;Graphs;Basic properties
Maths|5. Two Dimensional Analytical Geometry-II|Conics;Parabola;Ellipse;Hyperbola;Tangents;Normals
Maths|6. Applications of Vector Algebra|Scalar triple product;Vector triple product;Equations of lines;Equations of planes
Maths|7. Applications of Differential Calculus|Rates of change;Rolle's theorem;Mean value theorem;L'Hôpital's rule;Curve sketching
Maths|8. Differentials and Partial Derivatives|Linear approximation;Total differentials;Partial derivatives;Euler's theorem on homogeneous functions
Maths|9. Applications of Integration|Definite integrals;Reduction formulas;Area under plane curves;Volumes of solids of revolution
Maths|10. Ordinary Differential Equations|Order and degree;Variable separable method;First-order linear differential equations
Maths|11. Probability Distributions|Random variables;Probability density functions;Mathematical expectation;Mean and variance
Maths|12. Discrete Mathematics|Binary operations;Mathematical logic;Truth tables;Tautologies and contradictions
Physics|1. Electrostatics|Electric charges;Coulomb's law;Electric field;Electric potential;Gauss's law;Capacitors
Physics|2. Current Electricity|Ohm's law;Drift velocity;Kirchhoff's rules;Wheatstone bridge;Potentiometer
Physics|3. Magnetism and Magnetic Effects of Electric Current|Lorentz force;Ampere's circuital law;Cyclotron;Magnetic field due to a circular current loop;Earth's magnetism
Physics|4. Electromagnetic Induction and Alternating Current|Faraday's laws;Lenz's law;Self and mutual induction;AC generators;Transformers;LCR circuits
Physics|5. Electromagnetic Waves|Displacement current;Maxwell's equations;Electromagnetic spectrum
Physics|6. Ray Optics|Reflection and refraction at spherical surfaces;Total internal reflection;Thin lenses;Prism;Optical instruments
Physics|7. Wave Optics|Wavefronts;Huygens's principle;Young's double-slit experiment;Diffraction
Physics|8. Dual Nature of Radiation and Matter|Electron emission;Photoelectric effect;Einstein's photoelectric equation;de Broglie wavelength of matter waves
Physics|9. Atomic and Nuclear Physics|Atomic spectra;Rutherford and Bohr model;Radioactivity;Mass defect and nuclear binding energy;Nuclear fission;Nuclear fusion
Physics|10. Electronics and Communication Systems|Semiconductor diodes;Transistor characteristics;Logic gates;Principles of communication;Modulation and demodulation
Physics|11. Recent Developments in Physics|Nanoscience;Nanotechnology;Robotics
Chemistry|1. Metallurgy|Principles of metal extraction;Concentration of ores;Refining and zone refining;Ellingham diagram;Hall-Heroult process
Chemistry|2. p-Block Elements I|Group 13 general trends;Group 14 general trends;Compounds of boron;Compounds of carbon
Chemistry|3. p-Block Elements II|Group 15 elements;Group 16 elements;Group 17 elements;Group 18 elements;Important oxoacids and halides
Chemistry|4. Transition and Inner Transition Elements|d-block elements;f-block elements (lanthanides and actinides);Potassium permanganate (KMnO4);Potassium dichromate (K2Cr2O7)
Chemistry|5. Coordination Chemistry|Werner's theory;IUPAC nomenclature;Valence Bond Theory (VBT);Crystal Field Theory (CFT)
Chemistry|6. Solid State|Crystal lattices;Unit cells;Close-packed structures;Packing efficiency;Point and crystal defects
Chemistry|7. Chemical Kinetics|Rate of a reaction;Integrated rate equations;Half-life period;Collision theory;Arrhenius equation
Chemistry|8. Ionic Equilibrium|Acids and bases;pH scale;Buffer solutions;Solubility product (Ksp);Common ion effect
Chemistry|9. Electrochemistry|Specific and molar conductance;Kohlrausch's law;Nernst equation;Electrochemical cells;Secondary batteries;Corrosion
Chemistry|10. Surface Chemistry|Adsorption (physisorption and chemisorption);Catalysis;Colloids;Emulsion properties
Chemistry|11. Hydroxy Compounds and Ethers|Classification;Alcohols;Phenols;Ethers
Chemistry|12. Carbonyl Compounds and Carboxylic Acids|Aldehydes and ketones;Carboxylic acids;Nucleophilic addition;Cannizzaro reaction;Aldol condensation;Acid derivatives
Chemistry|13. Organic Nitrogen Compounds|Nitro compounds;Amines;Diazonium salts;Cyanides and isocyanides
Chemistry|14. Biomolecules|Carbohydrates;Proteins and amino acids;Nucleic acids (DNA and RNA);Vitamins
Chemistry|15. Chemistry in Everyday Life|Chemicals in medicines;Food additives;Cleansing agents`;
const SUBJ=["Maths","Physics","Chemistry"],SY={Maths:[],Physics:[],Chemistry:[]};
RAW.split("\n").forEach(l=>{const[s,c,t]=l.split("|");SY[s].push({ch:c,tp:t.split(";")})});
// ===== helpers =====
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad=n=>String(n).padStart(2,"0"),dstr=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()),TODAY=()=>dstr(new Date());
const daysLeft=()=>{const n=new Date();return Math.max(0,Math.ceil((EXAM-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5))};
const hm=s=>{s=Math.floor(s);return Math.floor(s/3600)+"h "+pad(Math.floor(s%3600/60))+"m"};
const clk=s=>{s=Math.max(0,Math.floor(s));return(s>=3600?Math.floor(s/3600)+":":"")+pad(Math.floor(s%3600/60))+":"+pad(s%60)};
let U=null;const K=k=>"target200_"+U+"_"+k;
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(K(k)))??d}catch{return d}};const put=(k,v)=>localStorage.setItem(K(k),JSON.stringify(v));
let topics,time,tTime,goals,list,view="today",st=null,det=null,lastSeen=0,stream=null,faceTimer=null;
function load(){topics=get("topics",{});time=get("time",{});tTime=get("topicTime",{});goals=get("goals",{});list=get("todayList",{})}
function saveAll(){put("topics",topics);put("time",time);put("topicTime",tTime);put("goals",goals);put("todayList",list)}
const tk=(s,c,t)=>s+"|"+SY[s][c].ch+"|"+SY[s][c].tp[t];
const todayTotal=()=>Object.values(time[TODAY()]||{}).reduce((a,b)=>a+b,0);
function addTime(subj,key){const d=TODAY();(time[d]??={})[subj]=(time[d][subj]||0)+1;const k=d+"|"+key;tTime[k]=(tTime[k]||0)+1;if(todayTotal()>=GOAL)goals[d]=true}
function streak(){let n=0,d=new Date();if(!goals[dstr(d)])d.setDate(d.getDate()-1);while(goals[dstr(d)]){n++;d.setDate(d.getDate()-1)}return n}
function pct(s){let a=0,b=0;(s?[s]:SUBJ).forEach(x=>SY[x].forEach((c,i)=>c.tp.forEach((_,j)=>{b++;if(topics[tk(x,i,j)])a++})));return b?Math.round(a/b*100):0}
const bar=p=>`<div class="bar"><i style="width:${p}%"></i></div>`;
function ring(secs){const p=Math.min(1,secs/GOAL),r=70,C=2*Math.PI*r;return`<svg class="ring" id="ring" width="180" height="180" viewBox="0 0 180 180"><circle cx="90" cy="90" r="${r}" fill="none" stroke="var(--bd)" stroke-width="12"/><circle cx="90" cy="90" r="${r}" fill="none" stroke="var(--ac)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}" transform="rotate(-90 90 90)"/><text class="rt" x="90" y="88" font-size="26" font-weight="700">${hm(secs)}</text><text class="rt" x="90" y="112" font-size="13" fill="var(--sec)" style="fill:var(--sec)">of 3h goal</text></svg>`}
// ===== login =====
$("lf").onsubmit=e=>{e.preventDefault();const id=$("sid").value.trim().toUpperCase(),a=ACCOUNTS[id];
if(!a||a.password!==$("pw").value){$("err").hidden=false;$("err").textContent="That ID or password is not right. Check it and try again.";return}
localStorage.setItem("target200_session",id);enter(id,true)};
function enter(id,pop){U=id;load();$("login").hidden=true;$("app").hidden=false;$("chip").textContent=daysLeft()+" days left";
if(pop){$("wdays").textContent=daysLeft();$("wmsg").textContent="Good to see you, "+ACCOUNTS[id].name.split(" ")[0]+". Today's goal: 3 hours.";$("welcome").hidden=false}go("today")}
$("wgo").onclick=()=>$("welcome").hidden=true;
$("out").onclick=()=>{endStudy();saveAll();localStorage.removeItem("target200_session");location.reload()};
$("nav").onclick=e=>{const v=e.target.dataset.v;if(v)go(v)};
function go(v){view=v;document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
({today:rToday,study:rStudy,syl:rSyl,prog:rProg})[v]()}
// ===== today =====
function opts(){return SUBJ.map(s=>`<optgroup label="${s}">`+SY[s].flatMap((c,i)=>c.tp.map((t,j)=>`<option value="${s}~${i}~${j}">${esc(c.ch.replace(/^\d+\. /,""))}: ${esc(t)}</option>`)).join("")+"</optgroup>").join("")}
function rToday(){const d=TODAY(),t=time[d]||{},tot=todayTotal(),mx=Math.max(GOAL/3,...SUBJ.map(s=>t[s]||0));
const items=Object.entries(list).filter(([k,v])=>v===d||!topics[k]).sort((a,b)=>a[1]<b[1]?-1:1);
$("main").innerHTML=`<h2>Hello, ${esc(ACCOUNTS[U].name.split(" ")[0])}</h2><div class="grid g2"><div class="card">${ring(tot)}<p class="mut" style="text-align:center;margin:.6rem 0 0">${streak()} day streak</p></div>
<div class="card"><h3>Time today</h3>${SUBJ.map(s=>`<div class="row"><span class="n"><i class="dot" style="background:var(--${s})"></i>${s}</span><div class="bar"><i style="width:${(t[s]||0)/mx*100}%;background:var(--${s})"></i></div><span class="v">${hm(t[s]||0)}</span></div>`).join("")}
<h3 style="margin-top:1rem">Syllabus done</h3><div class="row">${bar(pct())}<span class="v">${pct()}%</span></div></div></div>
<div class="card"><h3>Today's topics</h3>${items.length?items.map(([k,v])=>{const[s,c,tp]=k.split("|"),late=v<d?Math.round((new Date(d)-new Date(v))/864e5):0;return`<label class="tk"><input type="checkbox" data-k="${esc(k)}" ${topics[k]?"checked":""}><span><i class="dot" style="background:var(--${s})"></i>${esc(tp)} <span class="mut">${esc(c.replace(/^\d+\. /,""))}</span>${late?`<span class="tag">Carried over, ${late} day${late>1?"s":""}</span>`:""}</span></label>`}).join(""):`<p class="mut">Nothing planned yet. Add the topics you will study today.</p>`}
<label>Add a topic<select id="add"><option value="">Choose a topic</option>${opts()}</select></label></div>`;
$("add").onchange=e=>{if(!e.target.value)return;const[s,c,t]=e.target.value.split("~"),k=tk(s,c,t);if(!list[k]||topics[k])list[k]=TODAY();saveAll();rToday()};
document.querySelectorAll("[data-k]").forEach(c=>c.onchange=()=>{c.checked?topics[c.dataset.k]=true:delete topics[c.dataset.k];saveAll();rToday()})}
// ===== study =====
let pick={s:"Maths",c:0,t:0};
function rStudy(){if(st)return rLive();
$("main").innerHTML=`<h2>Start a study session</h2><div class="card"><div class="pills">${SUBJ.map(s=>`<button class="pill ${pick.s===s?"on":""}" data-s="${s}">${s}</button>`).join("")}</div>
<label>Chapter<select id="pc">${SY[pick.s].map((c,i)=>`<option value="${i}" ${pick.c==i?"selected":""}>${esc(c.ch)}</option>`).join("")}</select></label>
<label>Topic<select id="pt">${SY[pick.s][pick.c].tp.map((t,j)=>`<option value="${j}" ${pick.t==j?"selected":""}>${esc(t)}</option>`).join("")}</select></label>
<p class="mut" style="font-size:.9rem">Your camera is only used on this device to check you're at your desk. Nothing is recorded or uploaded.</p><button id="go" class="btn">Start</button></div>`;
document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{pick={s:b.dataset.s,c:0,t:0};rStudy()});
$("pc").onchange=e=>{pick.c=+e.target.value;pick.t=0;rStudy()};$("pt").onchange=e=>pick.t=+e.target.value;$("go").onclick=startStudy}
function banner(m){$("banner").hidden=!m;$("banner").textContent=m||""}
async function startCam(){stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:320,height:240}});const v=$("cam");v.srcObject=stream;v.hidden=false;await v.play();lastSeen=Date.now();
if(!det){const f=await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
det=await FaceDetector.createFromOptions(f,{baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"},runningMode:"VIDEO"})}
clearInterval(faceTimer);faceTimer=setInterval(()=>{if(v.readyState>=2&&det&&det.detectForVideo(v,performance.now()).detections.length)lastSeen=Date.now()},500)}
function stopCam(){clearInterval(faceTimer);stream?.getTracks().forEach(t=>t.stop());stream=null;$("cam").hidden=true}
async function startStudy(){const b=$("go");b.disabled=true;b.textContent="Starting camera...";
try{await startCam()}catch(e){b.disabled=false;b.textContent="Start";banner("Camera not available. Allow camera access in your browser, then press Start again.");setTimeout(()=>banner(),6000);return}
st={s:pick.s,key:tk(pick.s,pick.c,pick.t).split("|").slice(1).join("|"),topic:SY[pick.s][pick.c].tp[pick.t],secs:0,block:0,brk:0,asked:false};
st.key=st.s+"|"+st.key;st.key=st.key.replace(/^[^|]+\|/,"");st.fullKey=tk(pick.s,pick.c,pick.t);rLive()}
function rLive(){$("main").innerHTML=`<div class="card"><p class="mut" style="text-align:center;margin:0"><i class="dot" style="background:var(--${st.s})"></i>${st.s}: ${esc(st.topic)}</p><div class="timer" id="tm">${clk(st.brk?st.brk:st.secs)}</div><p id="stt" class="mut" style="text-align:center"></p>
<div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap"><button id="bk" class="btn alt">${st.brk?"End break":"Take a 30 minute break"}</button><button id="sp" class="btn">Finish session</button></div></div><div class="card">${ring(todayTotal())}</div>`;
$("bk").onclick=st.brk?endBreak:startBreak;$("sp").onclick=()=>{endStudy();go("today")}}
function startBreak(){st.brk=BREAK;st.brkEnd=Date.now()+BREAK*1e3;st.block=0;st.asked=false;stopCam();banner();saveAll();rLive()}
async function endBreak(){st.brk=0;try{await startCam()}catch{banner("Camera not available. Allow camera access to continue.")}rLive()}
function beep(){try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=660;g.gain.setValueAtTime(.2,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+1.2);o.start();o.stop(a.currentTime+1.2)}catch{}}
function endStudy(){if(!st)return;saveAll();stopCam();banner();st=null}
let n=0;
setInterval(()=>{if(!st||!U)return;
if(st.brk){st.brk=Math.max(0,Math.ceil((st.brkEnd-Date.now())/1e3));if(view==="study"&&$("tm"))$("tm").textContent=clk(st.brk);$("stt")&&($("stt").textContent="Break time. Study time is not counting.");
if(!st.brk){beep();banner("Break over. Press End break to continue.");setTimeout(()=>banner(),5000);if(view==="study")rLive()}return}
const here=Date.now()-lastSeen<5000&&!document.hidden;
if(here){st.secs++;st.block++;addTime(st.s,st.fullKey);if(++n%30===0)saveAll();banner()}
else if(Date.now()-lastSeen>=5000)banner(document.hidden?"":"Come back to your desk, timer paused.");
if(st.block>=BLOCK&&!st.asked){st.asked=true;banner("You have studied 90 minutes. Time for a 30 minute break.");setTimeout(()=>banner(),8000)}
if(view==="study"&&$("tm")){$("tm").textContent=clk(st.secs);$("stt").textContent=here?"Studying. Timer is running.":"Paused. Waiting for you to return.";const r=$("ring");if(r)r.outerHTML=ring(todayTotal())}},1000);
addEventListener("pagehide",()=>{if(U)saveAll()});
// ===== syllabus =====
let ssub="Maths";
function rSyl(){$("main").innerHTML=`<h2>Syllabus</h2><div class="pills">${SUBJ.map(s=>`<button class="pill ${ssub===s?"on":""}" data-s="${s}">${s} ${pct(s)}%</button>`).join("")}</div>`+SY[ssub].map((c,i)=>{const done=c.tp.filter((_,j)=>topics[tk(ssub,i,j)]).length,p=Math.round(done/c.tp.length*100);
return`<details data-i="${i}" ${window["o"+ssub+i]?"open":""}><summary>${esc(c.ch)} <span class="mut">${done}/${c.tp.length}</span></summary><div class="row">${bar(p)}<span class="v">${p}%</span></div>`+c.tp.map((t,j)=>`<label class="tk"><input type="checkbox" data-s="${ssub}" data-c="${i}" data-t="${j}" ${topics[tk(ssub,i,j)]?"checked":""}><span>${esc(t)}</span></label>`).join("")+"</details>"}).join("");
document.querySelectorAll(".pill").forEach(b=>b.onclick=()=>{ssub=b.dataset.s;rSyl()});
document.querySelectorAll("details").forEach(d=>d.ontoggle=()=>window["o"+ssub+d.dataset.i]=d.open);
document.querySelectorAll("input[data-c]").forEach(c=>c.onchange=()=>{const k=tk(c.dataset.s,c.dataset.c,c.dataset.t);c.checked?topics[k]=true:delete topics[k];saveAll();rSyl()})}
// ===== progress =====
function rProg(){const now=new Date(),dd=[];for(let i=0;i<31;i++){const x=new Date(now);x.setDate(x.getDate()-i);dd.push(dstr(x))}
const sum=days=>{const o={Maths:0,Physics:0,Chemistry:0};days.forEach(d=>SUBJ.forEach(s=>o[s]+=(time[d]||{})[s]||0));return o};
const per=[["Today",dd.slice(0,1)],["Last 7 days",dd.slice(0,7)],["Last 30 days",dd.slice(0,30)]].map(([l,d])=>[l,sum(d)]),mx=Math.max(1,...per.flatMap(([,o])=>Object.values(o)));
const tt={};Object.entries(tTime).forEach(([k,v])=>{const p=k.split("|");const key=p[1]+"|"+p[3];tt[key]=(tt[key]||0)+v});const top=Object.entries(tt).sort((a,b)=>b[1]-a[1]).slice(0,5);
$("main").innerHTML=`<h2>Progress</h2><div class="grid g2">`+per.map(([l,o])=>`<div class="card"><h3>${l}</h3><p class="mut" style="margin-top:0">${hm(Object.values(o).reduce((a,b)=>a+b,0))} studied</p>${SUBJ.map(s=>`<div class="row"><span class="n"><i class="dot" style="background:var(--${s})"></i>${s}</span><div class="bar"><i style="width:${o[s]/mx*100}%;background:var(--${s})"></i></div><span class="v">${hm(o[s])}</span></div>`).join("")}</div>`).join("")+
`<div class="card"><h3>Most studied topics</h3>${top.length?top.map(([k,v])=>`<div class="row"><span style="flex:1"><i class="dot" style="background:var(--${k.split("|")[0]})"></i>${esc(k.split("|")[1])}</span><span class="v">${hm(v)}</span></div>`).join(""):`<p class="mut">Start a study session and your topics will show up here.</p>`}</div></div>`}
// ===== boot =====
const sess=localStorage.getItem("target200_session");if(sess&&ACCOUNTS[sess])enter(sess,false);
