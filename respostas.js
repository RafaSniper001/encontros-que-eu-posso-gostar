// ==========================================
// ESTADO E CONFIGURAÇÃO DO DASHBOARD
// ==========================================
const APP_KEY = "4lgkk4au";
let refreshInterval;
let countdown = 10;
let countdownTimer;

document.addEventListener("DOMContentLoaded", () => {
  fetchResults();
  initParticles();
  setupEventListeners();
  startAutoRefresh();
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});

// ==========================================
// PROCESSO DE BUSCA E RENDERIZAÇÃO
// ==========================================
function fetchResults() {
  const container = document.getElementById("results-card");
  
  // Exibe loader
  container.innerHTML = `
    <div class="no-results">
      <i data-lucide="loader" class="icon-spin" style="width: 36px; height: 36px;"></i>
      <p style="margin-top: 15px;">Buscando novas respostas...</p>
    </div>
  `;
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  const targetUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${APP_KEY}/escolhas?t=${Date.now()}`;
  const isLocal = window.location.protocol === 'file:';
  const proxyUrl = isLocal 
    ? `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    : `/api/proxy?url=${encodeURIComponent(targetUrl)}&t=${Date.now()}`;
  
  fetch(proxyUrl)
    .then(response => response.text())
    .then(text => {
      let cleanText = text.trim();
      // Remove double quotes wrapping from string if present
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
        try {
          cleanText = JSON.parse(cleanText);
        } catch (e) {}
      }
      
      // Decode from Hex (UTF-8 safe)
      let jsonStr;
      try {
        const bytes = new Uint8Array(cleanText.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const decoder = new TextDecoder();
        jsonStr = decoder.decode(bytes);
      } catch (e) {
        jsonStr = cleanText;
      }
      
      const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;

      // Se não há dados válidos
      if (!data || !data.encontros || data.encontros.length === 0) {
        renderNoResults();
        return;
      }
      renderResults(data);
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `
        <div class="no-results">
          <i data-lucide="wifi-off" style="width: 36px; height: 36px; color: var(--accent-rose);"></i>
          <p style="margin-top: 15px; color: var(--accent-rose);">Erro ao carregar dados. Verifique a conexão!</p>
        </div>
      `;
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    });
}

function renderNoResults() {
  const container = document.getElementById("results-card");
  container.innerHTML = `
    <div class="no-results">
      <i data-lucide="heart-off" style="width: 48px; height: 48px;"></i>
      <p style="margin-top: 15px; font-weight: 500;">Nenhum encontro aceito ainda.</p>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">
        Envie o link para ela responder! Assim que ela confirmar, aparecerá aqui.
      </p>
    </div>
  `;
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function renderResults(data) {
  const container = document.getElementById("results-card");
  
  let html = `
    <div class="results-header">
      <h2 class="results-title">Encontros Escolhidos</h2>
      <span class="timestamp">Recebido em: ${data.timestamp || 'Horário Indisponível'}</span>
    </div>
    <div class="items-list">
  `;

  data.encontros.forEach(item => {
    // Tenta separar o emoji do texto para estilização, caso exista
    const match = item.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\S)\s+(.*)$/);
    let emoji = "✨";
    let title = item;
    
    if (match) {
      emoji = match[1];
      title = match[2];
    }

    html += `
      <div class="item-row">
        <span class="item-icon">${emoji}</span>
        <span class="item-text">${title}</span>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

// ==========================================
// EVENT LISTENERS E AUTO REFRESH
// ==========================================
function setupEventListeners() {
  const refreshBtn = document.getElementById("refresh-btn");
  refreshBtn.addEventListener("click", () => {
    fetchResults();
    resetCountdown();
  });
}

function startAutoRefresh() {
  resetCountdown();
  
  refreshInterval = setInterval(() => {
    fetchResults();
  }, 10000);
}

function resetCountdown() {
  clearInterval(countdownTimer);
  countdown = 10;
  updateCountdownText();
  
  countdownTimer = setInterval(() => {
    countdown--;
    if (countdown < 0) {
      countdown = 10;
    }
    updateCountdownText();
  }, 1000);
}

function updateCountdownText() {
  const textEl = document.getElementById("countdown-text");
  if (textEl) {
    textEl.textContent = `Próxima atualização em ${countdown}s`;
  }
}

// ==========================================
// EFEITOS ESPECIAIS (PARTÍCULAS DO CANVAS)
// ==========================================
let canvas, ctx, particles = [];

function initParticles() {
  canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Criar partículas iniciais
  for (let i = 0; i < 40; i++) {
    particles.push(createParticle(true));
  }

  animateParticles();
}

function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

function createParticle(randomY = false) {
  const isHeart = Math.random() > 0.6;
  return {
    x: Math.random() * canvas.width,
    y: randomY ? Math.random() * canvas.height : canvas.height + 20,
    size: Math.random() * 8 + 4,
    speedY: -(Math.random() * 0.8 + 0.3),
    speedX: Math.random() * 0.4 - 0.2,
    opacity: Math.random() * 0.3 + 0.1,
    type: isHeart ? "heart" : "bubble",
    color: Math.random() > 0.5 ? "#ff6b8b" : "#ae3ec9"
  };
}

function drawHeart(x, y, size, color, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(
    x - size / 2, y - size / 2, 
    x - size, y + topCurveHeight, 
    x, y + size
  );
  ctx.bezierCurveTo(
    x + size, y + topCurveHeight, 
    x + size / 2, y - size / 2, 
    x, y + topCurveHeight
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBubble(x, y, size, color, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function animateParticles() {
  if (!canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, index) => {
    p.y += p.speedY;
    p.x += p.speedX;

    if (p.type === "heart") {
      drawHeart(p.x, p.y, p.size, p.color, p.opacity);
    } else {
      drawBubble(p.x, p.y, p.size, p.color, p.opacity);
    }

    if (p.y < -20) {
      particles[index] = createParticle(false);
    }
  });

  requestAnimationFrame(animateParticles);
}
