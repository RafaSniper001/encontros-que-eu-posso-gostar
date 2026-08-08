// ==========================================
// ESTADO E CONFIGURAÇÃO DO DASHBOARD
// ==========================================
const APP_KEY = "4lgkk4au";
const OPCOES_ENCONTROS = [
  { id: "treino-juntos", titulo: "Treino Juntos", icone: "💪" },
  { id: "cafe-da-manha", titulo: "Café da Manhã", icone: "☕" },
  { id: "culto", titulo: "Culto", icone: "⛪" },
  { id: "show-cristao", titulo: "Show Cristão", icone: "🎵" },
  { id: "piquenique", titulo: "Piquenique", icone: "🧺" },
  { id: "futebol", titulo: "Estádio de Futebol", icone: "🏟️" },
  { id: "boliche", titulo: "Jogar Boliche", icone: "🎳" },
  { id: "karaoke", titulo: "Soltar a Voz no Karaokê", icone: "🎤" },
  { id: "parque", titulo: "Passeio no Parque", icone: "🌳" },
  { id: "jantar-especial", titulo: "Jantar Especial", icone: "🍕" },
  { id: "cinema-casa", titulo: "Cinema em Casa", icone: "🍿" },
  { id: "jogar-videogame", titulo: "Jogar Videogame", icone: "🎮" },
  { id: "cozinhar-juntos", titulo: "Cozinhar Juntos", icone: "🍳" },
  { id: "jogos-tabuleiro", titulo: "Café com Jogos de Tabuleiro", icone: "🎲" },
  { id: "rodizio", titulo: "Rodízio", icone: "🍣" },
  { id: "viagem-bate-volta", titulo: "Viagem Bate-Volta", icone: "🚗" }
];
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

  const isLocal = window.location.protocol === 'file:';
  
  // Criamos as URLs para as 5 chaves de escolhas individuais
  const fetchPromises = [1, 2, 3, 4, 5].map(idx => {
    const targetUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${APP_KEY}/escolhas_${idx}?t=${Date.now()}`;
    const proxyUrl = isLocal 
      ? `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
      : `/api/proxy?url=${encodeURIComponent(targetUrl)}&t=${Date.now()}`;
      
    return fetch(proxyUrl)
      .then(response => response.text())
      .then(text => {
        let cleanText = text.trim();
        if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
          try {
            cleanText = JSON.parse(cleanText);
          } catch (e) {}
        }
        
        if (!cleanText || cleanText === '""' || cleanText === 'Not Found') {
          return null;
        }

        try {
          // Decode from Hex
          const bytes = new Uint8Array(cleanText.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
          const decoder = new TextDecoder();
          const decodedStr = decoder.decode(bytes);
          return JSON.parse(decodedStr);
        } catch (e) {
          console.error(`Erro ao decodificar item ${idx}:`, e);
          return null;
        }
      })
      .catch(err => {
        console.error(`Erro ao buscar item ${idx}:`, err);
        return null;
      });
  });

  // Também buscamos a chave 'escolhas' (antiga) para migração
  const targetOldUrl = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${APP_KEY}/escolhas?t=${Date.now()}`;
  const oldProxyUrl = isLocal 
    ? `https://api.allorigins.win/raw?url=${encodeURIComponent(targetOldUrl)}`
    : `/api/proxy?url=${encodeURIComponent(targetOldUrl)}&t=${Date.now()}`;
    
  const oldFetch = fetch(oldProxyUrl)
    .then(response => response.text())
    .then(text => {
      let cleanText = text.trim();
      if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
        try {
          cleanText = JSON.parse(cleanText);
        } catch (e) {}
      }
      
      if (!cleanText || cleanText === '""' || cleanText === 'Not Found') {
        return null;
      }

      try {
        const bytes = new Uint8Array(cleanText.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const decoder = new TextDecoder();
        const decodedStr = decoder.decode(bytes);
        const parsed = JSON.parse(decodedStr);
        
        if (Array.isArray(parsed)) {
          return parsed;
        }
        if (parsed && parsed.encontros) {
          return [{
            t: parsed.timestamp || "Horário Indisponível",
            e: parsed.encontros
          }];
        }
        return null;
      } catch (e) {
        return null;
      }
    })
    .catch(() => null);

  Promise.all([...fetchPromises, oldFetch])
    .then(results => {
      let history = [];
      
      // Os primeiros 5 itens são individuais
      results.slice(0, 5).forEach(item => {
        if (item && item.t && item.e) {
          history.push(item);
        }
      });
      
      // O último item é o histórico antigo
      const oldItem = results[5];
      if (oldItem) {
        if (Array.isArray(oldItem)) {
          history.push(...oldItem);
        } else {
          history.push(oldItem);
        }
      }

      // Remover duplicados por timestamp e encontros
      const uniqueHistory = [];
      const seen = new Set();
      history.forEach(item => {
        const key = `${item.t}_${item.e.join(',')}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueHistory.push(item);
        }
      });

      if (uniqueHistory.length === 0) {
        renderNoResults();
        return;
      }

      // Ordenar cronologicamente (antigos primeiro) para que renderResults.reverse() coloque os novos no topo
      const parseTimestamp = (tStr) => {
        if (!tStr || tStr === "Horário Indisponível") return new Date(0);
        try {
          const match = tStr.match(/^(\d{2})\/(\d{2})(?:\/(\d{4}))?\s+(\d{2}):(\d{2})/);
          if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;
            const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
            const hours = parseInt(match[4]);
            const minutes = parseInt(match[5]);
            return new Date(year, month, day, hours, minutes);
          }
        } catch (e) {}
        return new Date(0);
      };

      uniqueHistory.sort((a, b) => parseTimestamp(a.t) - parseTimestamp(b.t));

      renderResults(uniqueHistory);
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
  
  // Normalizar o dado para sempre ser um array de envios
  let history = [];
  if (Array.isArray(data)) {
    history = [...data];
  } else if (data && data.encontros) {
    history = [{
      t: data.timestamp || 'Horário Indisponível',
      e: data.encontros
    }];
  }

  if (history.length === 0) {
    renderNoResults();
    return;
  }

  // Ordena os mais recentes no topo (ordem reversa)
  history.reverse();

  let html = "";
  
  history.forEach((submission, index) => {
    const isNewest = index === 0;
    
    // Reconstrói a lista de encontros por extenso
    let itemsText = [];
    
    // Se o envio estiver no novo formato (e = array de índices, c = custom)
    if (submission.e && Array.isArray(submission.e) && submission.e.length > 0 && typeof submission.e[0] === 'number') {
      submission.e.forEach(idx => {
        const option = OPCOES_ENCONTROS[idx];
        if (option) {
          itemsText.push(`${option.icone} ${option.titulo}`);
        }
      });
      if (submission.c && Array.isArray(submission.c)) {
        submission.c.forEach(text => {
          itemsText.push(`✨ ${text}`);
        });
      }
    } else if (submission.e && Array.isArray(submission.e)) {
      // Se for formato antigo (já com strings)
      itemsText = submission.e;
    }
    
    html += `
      <div class="submission-block" style="${index > 0 ? 'margin-top: 30px; border-top: 1px dashed var(--border-glass-hover); padding-top: 25px;' : ''}">
        <div class="results-header">
          <h2 class="results-title">${isNewest ? 'Última Escolha Recebida ✨' : 'Escolha Anterior'}</h2>
          <span class="timestamp">Recebido em: ${submission.t}</span>
        </div>
        <div class="items-list">
    `;

    itemsText.forEach(item => {
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

    html += `
        </div>
      </div>
    `;
  });

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
