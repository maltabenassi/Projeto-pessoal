let packets = 0; let displayedPackets = 0; let clickPower = 1; 
let buyAmount = '1'; let lastManualClick = Date.now();
let ppsMultiplier = 1; let clickMultiplier = 1;

const upgrades = {
    processor: { name: "UPGRADE_PROC", count: 1, cost: 100, rate: 2.3, power: 0, desc: "Dobra o clique" },
    auto: { name: "SCRIPT_v1", count: 0, cost: 15, rate: 1.15, power: 1, desc: "Mineração passiva" },
    server: { name: "DEDICATED_SRV", count: 0, cost: 200, rate: 1.15, power: 8, desc: "Servidor dedicado" },
    botnet: { name: "BOTNET_GLOBAL", count: 0, cost: 2500, rate: 1.15, power: 45, desc: "Rede zumbi" },
    mainframe: { name: "QUANTUM_MAIN", count: 0, cost: 25000, rate: 1.15, power: 180, desc: "Core quântico" },
    neural: { name: "NEURAL_NET", count: 0, cost: 200000, rate: 1.15, power: 750, desc: "Deep learning" },
    satellite: { name: "SATELLITE_LINK", count: 0, cost: 1500000, rate: 1.15, power: 3200, desc: "Link orbital" },
    deepweb: { name: "DEEP_WEB_MINER", count: 0, cost: 12000000, rate: 1.15, power: 15000, desc: "Camadas ocultas" },
    ai: { name: "AI_OVERLORD", count: 0, cost: 150000000, rate: 1.15, power: 85000, desc: "Singularidade" },
    glitch: { name: "REALITY_GLITCH", count: 0, cost: 2000000000, rate: 1.15, power: 650000, desc: "Matrix Break" }
};

// 1. Inicia a loja mantendo as descrições
function initShop() {
    const shop = document.getElementById('upgrade-list');
    shop.innerHTML = '';
    Object.keys(upgrades).forEach(key => {
        const up = upgrades[key];
        const info = key === 'processor' ? "Dobra Clique" : `Gera +${up.power} P/S`;
        shop.innerHTML += `
            <div class="upgrade-item hidden-upgrade" id="item-${key}">
                <button id="buy-${key}" class="upgrade-btn">
                    <span class="btn-title">${up.name} [LVL: <span id="${key}-count">${up.count}</span>]</span>
                    <span class="btn-info">Custo: <span id="${key}-cost">${up.cost.toLocaleString()}</span> | ${info}</span>
                </button>
            </div>`;
    });
    Object.keys(upgrades).forEach(key => {
        document.getElementById(`buy-${key}`).onclick = () => buyUpgrade(key);
    });
}

// 2. Spawn de números (Manual e Idle)
function spawnFloat(val, x, y, color) {
    const el = document.createElement('div');
    el.className = 'floating-num';
    el.innerText = `+${Math.floor(val).toLocaleString()}`;
    el.style.left = x + "px"; el.style.top = y + "px"; el.style.color = color;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

// 3. O Clique (Prioridade Máxima)
document.getElementById('click-me').onclick = (e) => {
    lastManualClick = Date.now();
    const gain = clickPower * clickMultiplier;
    packets += gain;
    spawnFloat(gain, e.clientX, e.clientY, "#00ff00");
    updateUI();
};

// 4. Lógica de Idle com o "+X" corrigido
function handleIdle() {
    const procLvl = upgrades.processor.count;
    const btn = document.getElementById('click-me');
    if ((Date.now() - lastManualClick) > 10000 && procLvl >= 2) {
        let cps = procLvl >= 50 ? 8 : procLvl >= 25 ? 4 : procLvl >= 10 ? 2 : 1;
        const gainPerTick = (clickPower * clickMultiplier * cps) / 10;
        packets += gainPerTick;
        btn.classList.add('auto-pulsing');
        document.getElementById('idle-status').innerText = `AUTO-MINING (${cps} clks/s)`;
        
        if (Math.random() < 0.1) {
            const r = btn.getBoundingClientRect();
            spawnFloat(gainPerTick * 10, r.left + (Math.random() * r.width), r.top, "#00d4ff");
        }
    } else {
        btn.classList.remove('auto-pulsing');
        document.getElementById('idle-status').innerText = "MODO MANUAL";
    }
}

function buyUpgrade(key) {
    const up = upgrades[key];
    let n = buyAmount === 'max' ? Math.max(1, Math.floor(Math.log((packets * (up.rate - 1) / up.cost) + 1) / Math.log(up.rate))) : parseInt(buyAmount);
    const cost = Math.ceil(up.cost * (Math.pow(up.rate, n) - 1) / (up.rate - 1));
    if (packets >= cost) {
        packets -= cost;
        if (key === 'processor') { for(let i=0; i<n; i++){ upgrades.processor.count++; clickPower *= 2; } }
        else { upgrades[key].count += n; }
        up.cost = Math.ceil(up.cost * Math.pow(up.rate, n));
        updateUI(); saveGame();
    }
}

function updateUI() {
    const pps = Object.keys(upgrades).reduce((acc, k) => k==='processor' ? acc : acc + (upgrades[k].count * upgrades[k].power), 0);
    document.getElementById('pps').innerText = Math.floor(pps * ppsMultiplier).toLocaleString();
    document.getElementById('click-power-display').innerText = (clickPower * clickMultiplier).toLocaleString();
    
    for (const k in upgrades) {
        const up = upgrades[k];
        if (packets >= up.cost || up.count > 0) document.getElementById(`item-${k}`)?.classList.remove('hidden-upgrade');
        const btn = document.getElementById(`buy-${k}`);
        if(btn) {
            btn.disabled = (packets < up.cost);
            document.getElementById(`${k}-cost`).innerText = up.cost.toLocaleString();
            document.getElementById(`${k}-count`).innerText = up.count;
        }
    }
}

function animate() {
    if (Math.abs(packets - displayedPackets) > 0.1) {
        displayedPackets += (packets - displayedPackets) * 0.2;
        document.getElementById('counter').innerText = Math.floor(displayedPackets).toLocaleString();
    }
}

function saveGame() { localStorage.setItem('hacker_v10', JSON.stringify({ p: packets, cp: clickPower, u: upgrades })); }
function loadGame() {
    const s = JSON.parse(localStorage.getItem('hacker_v10'));
    if (s) { packets = s.p; clickPower = s.cp; displayedPackets = packets; for(const k in s.u) Object.assign(upgrades[k], s.u[k]); }
    updateUI();
}

document.querySelectorAll('.batch-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.batch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buyAmount = btn.getAttribute('data-amount');
    };
});

document.getElementById('open-sidebar').onclick = () => document.getElementById('side-menu').classList.add('active');
document.getElementById('close-sidebar').onclick = () => document.getElementById('side-menu').classList.remove('active');
document.getElementById('reset-game').onclick = () => { localStorage.clear(); location.reload(); };

initShop(); loadGame();
setInterval(() => { 
    const pps = Object.keys(upgrades).reduce((acc, k) => k==='processor' ? acc : acc + (upgrades[k].count * upgrades[k].power), 0);
    packets += (pps * ppsMultiplier) / 10; 
    handleIdle(); updateUI(); 
}, 100);
setInterval(animate, 40);
