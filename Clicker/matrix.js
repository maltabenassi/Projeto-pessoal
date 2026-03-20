/* matrix.js */
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let fontSize = 16;
let columns = 0;
let drops = [];

// Caracteres: Binário (Root ADS Style)
const characters = "01"; 

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Ajusta a HUD recta para não vazar
    fontSize = 16;
    if(window.innerWidth < 420) fontSize = 14;

    columns = Math.floor(window.innerWidth / fontSize);
    drops = [];
    for (let x = 0; x < columns; x++) {
        // FIX: Garantir que cobrimos TODAS as colunas
        drops[x] = 1;
    }
}

function draw() {
    // Task: Fundo gradualmente preto para efeito de rastro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // NOVO: A cor da Matrix é herdada do Body via CSS Variable para Sincronia de Brecha
    // Se o Body ficar vermelho, a matrix também fica (graças ao filtro CSS).
    // Aqui no JS, mantemos o 'green' padrão para que o filtro sepia/hue-rotate no style.css funcione.
    ctx.fillStyle = '#0f0'; // Cor verde Matrix padrão

    ctx.font = `bold ${fontSize}px monospace`; // Task: Mesma fonte do sistema

    for (let i = 0; i < columns; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > window.innerHeight && Math.random() > 0.985) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
setInterval(draw, 40); // Task: Velocidade Matrix padrão