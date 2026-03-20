/* script.js - HACKER CLICKER V10 */

let packets = 0;
let displayedPackets = 0;
let buyAmount = '1';
let lastManualClick = Date.now();
let lastIdleVisualTime = 0;

const orbCanvas = document.getElementById('orb-canvas');
const orbCtx = orbCanvas.getContext('2d');
let orbCascades = [];

let isBreachActive = false;
let breachMultiplier = 1;
let breachInterval = null; 

const basePrices = {
    processor: 50, auto: 15, server: 200, botnet: 2500,
    mainframe: 25000, neural: 200000, satellite: 1500000,
    deepweb: 12000000, ai: 150000000, glitch: 2000000000
};

const upgrades = {
    processor: { name: "UPGRADE_PROC", count: 0, cost: 50, rate: 1.35, power: 1, desc: "Melhora cliques" },
    auto: { name: "SCRIPT_v1", count: 0, cost: 15, rate: 1.15, power: 1, desc: "Gera P/S" },
    server: { name: "DEDICATED_SRV", count: 0, cost: 200, rate: 1.15, power: 8, desc: "Gera P/S" },
    botnet: { name: "BOTNET_GLOBAL", count: 0, cost: 2500, rate: 1.15, power: 45, desc: "Gera P/S" },
    mainframe: { name: "QUANTUM_MAIN", count: 0, cost: 25000, rate: 1.15, power: 180, desc: "Gera P/S" },
    neural: { name: "NEURAL_NET", count: 0, cost: 200000, rate: 1.15, power: 750, desc: "Gera P/S" },
    satellite: { name: "SATELLITE_LINK", count: 0, cost: 1500000, rate: 1.15, power: 3200, desc: "Gera P/S" },
    deepweb: { name: "DEEP_WEB_MINER", count: 0, cost: 12000000, rate: 1.15, power: 15000, desc: "Gera P/S" },
    ai: { name: "AI_OVERLORD", count: 0, cost: 150000000, rate: 1.15, power: 85000, desc: "Gera P/S" },
    glitch: { name: "REALITY_GLITCH", count: 0, cost: 2000000000, rate: 1.15, power: 650000, desc: "Gera P/S" }
};

const tierColors = ['#00ff00', '#00d4ff', '#ff00ff', '#ffaa00', '#ff0044', '#ffffff', '#ffcc00', 'rainbow'];

function resizeOrbCanvas() { if (orbCanvas) { orbCanvas.width = orbCanvas.offsetWidth; orbCanvas.height = orbCanvas.offsetHeight; } }

function getClickTierColor() {
    const milestones = getMilestones(upgrades.processor.count, true);
    let reached = milestones.filter(m => upgrades.processor.count >= m).length;
    let color = tierColors[Math.min(reached, tierColors.length - 1)];
    if (color === 'rainbow') color = `hsl(${Date.now() % 360}, 100%, 70%)`;
    return color;
}

function spawnCascade(forceColor = null) {
    const x = Math.random() * orbCanvas.width;
    const speed = 2 + Math.random() * 5;
    let color = forceColor || (Date.now() - lastManualClick < 10000 ? "#00ff00" : getClickTierColor());
    if (isBreachActive) color = "#ff0044";
    orbCascades.push({ x: x, y: -20, speed: speed, chars: Array.from({ length: 5 }, () => Math.round(Math.random())), color: color, opacity: 1 });
}

function updateOrbCanvas() {
    orbCtx.fillStyle = 'rgba(0, 0, 0, 0.15)'; orbCtx.fillRect(0, 0, orbCanvas.width, orbCanvas.height);
    orbCtx.font = 'bold 12px monospace';
    for (let i = orbCascades.length - 1; i >= 0; i--) {
        let c = orbCascades[i]; orbCtx.fillStyle = c.color; orbCtx.globalAlpha = c.opacity;
        c.chars.forEach((char, idx) => { orbCtx.fillText(char, c.x, c.y - (idx * 15)); });
        c.y += c.speed; c.opacity -= 0.01;
        if (c.y > orbCanvas.height + 50 || c.opacity <= 0) orbCascades.splice(i, 1);
    }
    orbCtx.globalAlpha = 1; requestAnimationFrame(updateOrbCanvas);
}

// NOVO: Milestone 75 integrado e regra de 50 em 50 ativada
function getMilestones(targetLvl, isProcessor) {
    let m = [25, 50, 75, 100];
    if (isProcessor) m.unshift(10); 
    for (let i = 150; i <= targetLvl + 50; i += 50) m.push(i);
    return m;
}

function getClickPower() {
    const lvl = upgrades.processor.count;
    let power = 1; let increment = 1;
    const milestones = getMilestones(lvl, true);
    for (let i = 1; i <= lvl; i++) { power += increment; if (milestones.includes(i)) { power *= 2; increment *= 2; } }
    return power * breachMultiplier;
}

function getItemPPS(key) {
    const up = upgrades[key]; if (!up || key === 'processor') return 0;
    const milestones = getMilestones(up.count, false);
    let reached = milestones.filter(m => up.count >= m).length;
    return up.power * up.count * Math.pow(2, reached) * breachMultiplier;
}

function initShop() {
    const shop = document.getElementById('upgrade-list'); if (!shop) return;
    shop.innerHTML = '';
    Object.keys(upgrades).forEach(key => {
        const up = upgrades[key];
        shop.innerHTML += `<div class="upgrade-item hidden-upgrade" id="item-${key}"><button id="buy-${key}" class="upgrade-btn"><span class="btn-title">${up.name} [LVL: <span id="${key}-count">${up.count}</span>]</span><span class="btn-info">Custo: <span id="${key}-cost">${up.cost.toLocaleString()}</span> | <span id="${key}-desc">...</span></span></button></div>`;
    });
    Object.keys(upgrades).forEach(key => { const btn = document.getElementById(`buy-${key}`); if (btn) btn.onclick = () => buyUpgrade(key); });
}

function updateUI() {
    const ppsTotal = Object.keys(upgrades).reduce((acc, k) => acc + getItemPPS(k), 0);
    const clickPwr = getClickPower();
    document.getElementById('pps').innerText = Math.floor(ppsTotal).toLocaleString();
    document.getElementById('click-power-display').innerText = Math.floor(clickPwr).toLocaleString();
    
    const isIdle = (Date.now() - lastManualClick) > 10000;
    let targetColor = isIdle ? getClickTierColor() : "#00ff00"; 
    if (isBreachActive) targetColor = "#ff0044";

    const btnClick = document.getElementById('click-me');
    const banner = document.getElementById('idle-status');
    const barFill = document.getElementById('data-progress-bar');
    
    if(btnClick) btnClick.style.setProperty('--flash-color', targetColor);
    if(banner) banner.style.setProperty('--flash-color', targetColor);
    if(barFill) { 
        barFill.style.background = targetColor; 
        barFill.style.boxShadow = `0 0 10px ${targetColor}`;
        if (packets > 0) {
            const magnitude = Math.floor(Math.log10(packets));
            barFill.style.width = `${(packets / Math.pow(10, magnitude + 1)) * 100}%`;
        }
    }

    if (!breachInterval && (upgrades.auto.count > 0 || upgrades.server.count > 0)) startBreachSystem();

    for (const k in upgrades) {
        const up = upgrades[k];
        const itemRow = document.getElementById(`item-${k}`);
        if (up.count > 0 || packets >= basePrices[k]) itemRow?.classList.remove('hidden-upgrade');
        const btn = document.getElementById(`buy-${k}`);
        if (btn) {
            let nPreview = 0;
            if (buyAmount === 'max') nPreview = Math.floor(Math.log((packets * (up.rate - 1) / up.cost) + 1) / Math.log(up.rate));
            else { let amt = parseInt(buyAmount); let cost = Math.ceil(up.cost * (Math.pow(up.rate, amt) - 1) / (up.rate - 1)); if (packets >= cost) nPreview = amt; }
            btn.disabled = (nPreview <= 0);
            let previewText = nPreview > 0 ? ` <span class="cyan-preview">(+${nPreview.toLocaleString()})</span>` : "";
            document.getElementById(`${k}-cost`).innerText = up.cost.toLocaleString();
            document.getElementById(`${k}-count`).innerHTML = `${up.count}${previewText}`;
            
            const milestones = getMilestones(up.count, k === 'processor');
            let reached = milestones.filter(m => up.count >= m).length;
            if (itemRow) itemRow.className = `upgrade-item tier-${Math.min(reached, 8)} ${up.count > 0 || packets >= basePrices[k] ? '' : 'hidden-upgrade'}`;
            
            // NOVO: Descrição Limpa (Unitário | Lote se > 1 | Total)
            const descSpan = document.getElementById(`${k}-desc`);
            if (descSpan) {
                if (k === 'processor') {
                    descSpan.innerText = `Poder: ${Math.floor(getClickPower()).toLocaleString()}`;
                } else {
                    const unitPPS = up.power * Math.pow(2, reached) * breachMultiplier;
                    const totalForItem = getItemPPS(k);
                    const batchGain = unitPPS * nPreview;
                    
                    let text = `Gera +${unitPPS.toLocaleString()} P/S cada`;
                    // REMOVIDO: Parenteses redundante se a compra for de apenas 1x
                    if (nPreview > 1) text += ` (+${batchGain.toLocaleString()} P/S)`; 
                    text += ` | Total: ${Math.floor(totalForItem).toLocaleString()} P/S`;
                    descSpan.innerHTML = text;
                }
            }
        }
    }
}

document.getElementById('click-me').onclick = function(e) {
    e.preventDefault();
    lastManualClick = Date.now();
    const btn = document.getElementById('click-me');
    btn.classList.add('is-pulsing'); setTimeout(() => btn.classList.remove('is-pulsing'), 50);
    let color = isBreachActive ? "#ff0044" : "#00ff00";
    spawnCascade(color);
    packets += getClickPower();
    // NOVO: Garantia de spawn do (+X) no clique manual
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    spawnFloat(getClickPower(), x, y, color);
    updateUI();
};

function buyUpgrade(key) {
    const up = upgrades[key]; let n = 0;
    if (buyAmount === 'max') n = Math.floor(Math.log((packets * (up.rate - 1) / up.cost) + 1) / Math.log(up.rate));
    else { let amt = parseInt(buyAmount); let cost = Math.ceil(up.cost * (Math.pow(up.rate, amt) - 1) / (up.rate - 1)); if (packets >= cost) n = amt; }
    if (n > 0) {
        const totalCost = Math.ceil(up.cost * (Math.pow(up.rate, n) - 1) / (up.rate - 1));
        packets -= totalCost; up.count += n; up.cost = Math.ceil(up.cost * Math.pow(up.rate, n));
        updateUI(); saveGame();
    }
}

function startBreachSystem() {
    if (breachInterval) clearInterval(breachInterval);
    breachInterval = setInterval(() => { if (Math.random() < 0.3) spawnBreachTrigger(); }, 60000);
}

function spawnBreachTrigger() {
    if (isBreachActive) return;
    const trigger = document.createElement('div');
    trigger.id = 'breach-trigger';
    trigger.className = 'breach-trigger-icon';
    trigger.innerHTML = '⚠️';
    const p = 60;
    trigger.style.top = `${p + Math.random() * (window.innerHeight - p * 2)}px`;
    trigger.style.left = `${p + Math.random() * (window.innerWidth - p * 2)}px`;
    trigger.onclick = () => { trigger.remove(); runBreachEvent(); };
    document.body.appendChild(trigger);
    logSystem("DETECTADO: BRECHA NO NÚCLEO!");
    setTimeout(() => { if (trigger.parentNode) trigger.remove(); }, 8000);
}

function runBreachEvent() {
    isBreachActive = true; breachMultiplier = 3;
    document.body.classList.add('body-breach-active');
    logSystem("⚠️ BRECHA ATIVA: GANHOS X3 POR 15s!");
    updateUI();
    setTimeout(() => {
        isBreachActive = false; breachMultiplier = 1;
        document.body.classList.remove('body-breach-active');
        logSystem("SISTEMA RESTAURADO.");
        updateUI();
    }, 15000);
}

function handleIdle() {
    const procLvl = upgrades.processor.count; const banner = document.getElementById('idle-status');
    if ((Date.now() - lastManualClick) > 10000 && procLvl >= 1) {
        const milestones = getMilestones(procLvl, true); let reached = milestones.filter(m => procLvl >= m).length;
        let cps = Math.pow(2, reached); packets += (getClickPower() * cps) / 10;
        if (banner) { banner.innerText = `AUTO-MINING (${cps} clks/s)`; banner.classList.add('neon-pulsing'); }
    } else {
        if (banner) { banner.innerText = "MODO MANUAL"; banner.classList.remove('neon-pulsing'); }
    }
}

function animate() {
    if (Math.abs(packets - displayedPackets) > 0.1) {
        displayedPackets += (packets - displayedPackets) * 0.2;
        const countEl = document.getElementById('counter'); if (countEl) countEl.innerText = Math.floor(displayedPackets).toLocaleString();
    }
    const now = Date.now();
    if ((now - lastManualClick) > 10000 && upgrades.processor.count >= 1) {
        const milestones = getMilestones(upgrades.processor.count, true);
        let reached = milestones.filter(m => upgrades.processor.count >= m).length;
        let cps = Math.pow(2, reached);
        if (now - lastIdleVisualTime >= (1000 / cps)) {
            let color = isBreachActive ? "#fff" : getClickTierColor();
            spawnCascade(color);
            const btn = document.getElementById('click-me');
            if (btn) {
                const r = btn.getBoundingClientRect();
                spawnFloat(getClickPower(), r.left + r.width/2, r.top, color);
                btn.classList.add('is-pulsing'); setTimeout(() => btn.classList.remove('is-pulsing'), 100);
            }
            lastIdleVisualTime = now;
        }
    }
}

function saveGame() { localStorage.setItem('hacker_v10', JSON.stringify({ p: packets, u: upgrades })); }
function loadGame() {
    try {
        const s = JSON.parse(localStorage.getItem('hacker_v10'));
        if (s) { 
            packets = s.p; displayedPackets = packets;
            for (const k in s.u) { if (upgrades[k]) Object.assign(upgrades[k], s.u[k]); }
            Object.keys(upgrades).forEach(key => { let up = upgrades[key]; up.cost = Math.ceil(basePrices[key] * Math.pow(up.rate, up.count)); });
        }
    } catch (e) { console.warn("Erro no load."); }
    updateUI();
}

// NOVO: Botões de Debug Religados
document.getElementById('debug-boost').onclick = () => { packets += 1000000; updateUI(); };
document.getElementById('debug-reset').onclick = () => { localStorage.clear(); location.reload(); };
document.getElementById('debug-breach').onclick = () => spawnBreachTrigger();

document.getElementById('open-sidebar').onclick = () => document.getElementById('side-menu').classList.add('active');
document.getElementById('close-sidebar').onclick = () => document.getElementById('side-menu').classList.remove('active');
document.getElementById('reset-game').onclick = () => { localStorage.clear(); location.reload(); };

resizeOrbCanvas(); window.addEventListener('resize', resizeOrbCanvas);
initShop(); loadGame(); 
document.querySelectorAll('.batch-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.batch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); buyAmount = btn.getAttribute('data-amount'); updateUI();
    };
});

setInterval(() => { packets += (Object.keys(upgrades).reduce((acc, k) => acc + getItemPPS(k), 0) / 10); handleIdle(); updateUI(); }, 100);
setInterval(animate, 40); updateOrbCanvas(); 

function spawnFloat(val, x, y, color) {
    const el = document.createElement('div'); el.className = 'floating-num'; el.innerText = `+${Math.floor(val).toLocaleString()}`;
    el.style.left = x + "px"; el.style.top = y + "px"; el.style.color = color; document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

function logSystem(msg) {
    const log = document.getElementById('system-log');
    if (log) { log.innerHTML = `<div>> ${msg}</div>` + log.innerHTML; if (log.children.length > 5) log.lastChild.remove(); }
}
