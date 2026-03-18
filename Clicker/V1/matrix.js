const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const characters = "01";
const fontSize = 16;
let drops = []; 
let particles = []; 
let maxDrops = 0;
let globalSpeedFactor = 1.0; // Fator de velocidade global (NOVO)

// --- LÓGICA DE SATURAÇÃO (NOVO) ---
function updateMatrixBackground(scriptCount) {
    // Cálculo sugerido: cada script adiciona 1.2 "unidades de densidade".
    // Delimitamos a quantidade máxima de gotas para 60 (preenche cerca de 50% de Full HD).
    maxDrops = Math.min(Math.floor(scriptCount * 1.2), 60);

    // Quando atinge o limite de gotas, comprar mais upgrades aumenta a VELOCIDADE
    if (scriptCount > 50) {
        // A velocidade sobe 1% a cada upgrade após 50 (S-Curve)
        globalSpeedFactor = 1.0 + (scriptCount - 50) * 0.01;
    } else {
        globalSpeedFactor = 1.0;
    }
}

function createParticle(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            velX: (Math.random() - 0.5) * 10,
            velY: (Math.random() - 0.5) * 10,
            life: 1.0, 
            char: Math.random() > 0.5 ? "1" : "0"
        });
    }
}

function createDrop() {
    const totalColumns = Math.floor(canvas.width / fontSize);
    return {
        x: Math.floor(Math.random() * totalColumns) * fontSize,
        y: Math.random() * -100,
        // Velocidade base que será multiplicada pelo fator global
        speedBase: Math.random() * 0.5 + 0.2
    };
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Mantém o fundo escuro para leitura
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0, 255, 0, 0.2)"; // Baixa opacidade para não brigar com UI
    ctx.font = `${fontSize}px Courier New`;

    // Gerencia a quantidade de gotas
    while (drops.length < maxDrops) drops.push(createDrop());
    if (drops.length > maxDrops && maxDrops >= 0) drops.length = maxDrops;

    // Desenha gotas da Matrix
    drops.forEach((drop) => {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, drop.x, drop.y * fontSize);
        
        // NOVO: A velocidade real é a velocidade base x Fator Global
        drop.y += drop.speedBase * globalSpeedFactor;

        if (drop.y * fontSize > canvas.height) {
            const totalColumns = Math.floor(canvas.width / fontSize);
            drop.x = Math.floor(Math.random() * totalColumns) * fontSize;
            drop.y = Math.random() * -20;
        }
    });

    // Desenha Partículas de Clique
    particles.forEach((p, index) => {
        ctx.fillStyle = `rgba(0, 255, 0, ${p.life})`;
        ctx.fillText(p.char, p.x, p.y);
        
        p.x += p.velX;
        p.y += p.velY;
        p.life -= 0.02;

        if (p.life <= 0) particles.splice(index, 1);
    });

    requestAnimationFrame(drawMatrix);
}

drawMatrix();
