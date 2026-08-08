// ==========================================
// CONFIGURAÇÕES DA PÁGINA
// ==========================================

// Se você quiser que o link envie DIRETAMENTE para o seu WhatsApp, 
// coloque o seu número com DDD (somente números, ex: "5511999999999") abaixo.
// Se deixar vazio, ela poderá escolher com qual contato compartilhar ao abrir o WhatsApp.
const SEU_TELEFONE_WHATSAPP = "";

// Opções de Encontros Iniciais
const OPCOES_ENCONTROS = [
  {
    id: "treino-juntos",
    titulo: "Treino Juntos",
    descricao: "Aquele treino funcional ou musculação focado na parceria e na saúde.",
    icone: "💪",
    themeColor: "var(--accent-orange)",
    glowColor: "rgba(255, 146, 43, 0.15)"
  },
  {
    id: "cafe-da-manha",
    titulo: "Café da Manhã",
    descricao: "Começar o dia saindo da rotina para tomar um café especial fora de casa.",
    icone: "☕",
    themeColor: "var(--accent-teal)",
    glowColor: "rgba(32, 201, 151, 0.15)"
  },
  {
    id: "culto",
    titulo: "Culto",
    descricao: "Ir à igreja juntos agradecer, adorar e fortalecer a fé.",
    icone: "⛪",
    themeColor: "var(--accent-purple)",
    glowColor: "rgba(174, 62, 199, 0.15)"
  },
  {
    id: "show-cristao",
    titulo: "Show Cristão",
    descricao: "Cantar e curtir um show gospel ou evento musical ao vivo.",
    icone: "🎵",
    themeColor: "var(--accent-blue)",
    glowColor: "rgba(51, 154, 240, 0.15)"
  },
  {
    id: "piquenique",
    titulo: "Piquenique",
    descricao: "Cesta de lanchinhos, toalha xadrez e uma boa conversa sob a sombra de uma árvore.",
    icone: "🧺",
    themeColor: "var(--accent-green)",
    glowColor: "rgba(81, 207, 102, 0.15)"
  },
  {
    id: "futebol",
    titulo: "Estádio de Futebol",
    descricao: "Sentir a energia vibrante da torcida e ver um jogo emocionante juntos.",
    icone: "🏟️",
    themeColor: "var(--accent-blue)",
    glowColor: "rgba(51, 154, 240, 0.15)"
  },
  {
    id: "boliche",
    titulo: "Jogar Boliche",
    descricao: "Uma competição super divertida com direito a strikes, canaletas e boas risadas.",
    icone: "🎳",
    themeColor: "var(--accent-purple)",
    glowColor: "rgba(174, 62, 199, 0.15)"
  },
  {
    id: "karaoke",
    titulo: "Soltar a Voz no Karaokê",
    descricao: "Cantar nossas músicas favoritas (mesmo desafinando) e dar muitas risadas.",
    icone: "🎤",
    themeColor: "var(--accent-rose)",
    glowColor: "rgba(255, 107, 139, 0.15)"
  },
  {
    id: "parque",
    titulo: "Passeio no Parque",
    descricao: "Caminhar ao ar livre, tomar um sorvete e conversar sem pressa.",
    icone: "🌳",
    themeColor: "var(--accent-teal)",
    glowColor: "rgba(32, 201, 151, 0.15)"
  },
  {
    id: "jantar-especial",
    titulo: "Jantar Especial",
    descricao: "Massa, hambúrguer artesanal ou aquele restaurante novo que queremos conhecer.",
    icone: "🍕",
    themeColor: "var(--accent-orange)",
    glowColor: "rgba(255, 146, 43, 0.15)"
  },
  {
    id: "cinema-casa",
    titulo: "Cinema em Casa",
    descricao: "Pipoca quentinha, cobertor confortável e uma maratona das nossas séries ou filmes.",
    icone: "🍿",
    themeColor: "var(--accent-gold)",
    glowColor: "rgba(252, 196, 25, 0.15)"
  },
  {
    id: "jogar-videogame",
    titulo: "Jogar Videogame",
    descricao: "Disputa amigável nos jogos de corrida, esporte ou aventura cooperativa.",
    icone: "🎮",
    themeColor: "var(--accent-purple)",
    glowColor: "rgba(174, 62, 199, 0.15)"
  },
  {
    id: "cozinhar-juntos",
    titulo: "Cozinhar Juntos",
    descricao: "Escolher uma receita nova na internet e preparar o prato em dupla.",
    icone: "🍳",
    themeColor: "var(--accent-orange)",
    glowColor: "rgba(255, 146, 43, 0.15)"
  },
  {
    id: "jogos-tabuleiro",
    titulo: "Café com Jogos de Tabuleiro",
    descricao: "Uma tarde deliciosa regada a lanches e partidas de jogos de estratégia ou diversão.",
    icone: "🎲",
    themeColor: "var(--accent-gold)",
    glowColor: "rgba(252, 196, 25, 0.15)"
  },
  {
    id: "rodizio",
    titulo: "Rodízio",
    descricao: "Comer até não aguentar mais (Comida Japonesa, Pizza ou Churrasco).",
    icone: "🍣",
    themeColor: "var(--accent-rose)",
    glowColor: "rgba(255, 107, 139, 0.15)"
  },
  {
    id: "viagem-bate-volta",
    titulo: "Viagem Bate-Volta",
    descricao: "Pegar a estrada no fim de semana para conhecer uma cidade vizinha.",
    icone: "🚗",
    themeColor: "var(--accent-teal)",
    glowColor: "rgba(32, 201, 151, 0.15)"
  }
];

// Estado da Aplicação
const appState = {
  selecionados: new Set(),
  customSuggestions: []
};

// ==========================================
// INICIALIZAÇÃO E RENDERIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  initParticles();
  setupEventListeners();
  
  // Inicializa os ícones do Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});

// Renderizar os cards na grid
function renderCards() {
  const grid = document.getElementById("dates-grid");
  grid.innerHTML = "";

  OPCOES_ENCONTROS.forEach(opcao => {
    const card = document.createElement("div");
    card.className = "date-card";
    card.dataset.id = opcao.id;
    card.style.setProperty("--theme-color", opcao.themeColor);
    card.style.setProperty("--glow-color", opcao.glowColor);

    card.innerHTML = `
      <div class="card-top">
        <div class="icon-wrapper">
          <span>${opcao.icone}</span>
        </div>
        <div class="heart-check">
          <i data-lucide="heart"></i>
        </div>
      </div>
      <div class="card-content">
        <h3 class="card-title">${opcao.titulo}</h3>
        <p class="card-desc">${opcao.descricao}</p>
      </div>
    `;

    // Interatividade 3D Tilt sutil no mousemove
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });

    // Clique para selecionar
    card.addEventListener("click", () => toggleSelect(opcao.id, card));

    grid.appendChild(card);
  });

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ==========================================
// GERENCIAMENTO DE SELEÇÃO
// ==========================================

function toggleSelect(id, cardElement) {
  if (appState.selecionados.has(id)) {
    appState.selecionados.delete(id);
    cardElement.classList.remove("selected");
  } else {
    appState.selecionados.add(id);
    cardElement.classList.add("selected");
    // Trigger sutil de corações ao selecionar
    createHeartBlast(cardElement);
  }
  
  updateBottomBar();
}

function updateBottomBar() {
  const bottomBar = document.getElementById("bottom-bar");
  const countBadge = document.getElementById("selected-count");
  const statusText = document.getElementById("status-text");
  
  const total = appState.selecionados.size + appState.customSuggestions.length;
  
  if (total > 0) {
    bottomBar.classList.add("visible");
    countBadge.textContent = total;
    
    // Animação de pop no contador
    countBadge.classList.remove("pop");
    void countBadge.offsetWidth; // Trigger reflow
    countBadge.classList.add("pop");
    
    statusText.textContent = total === 1 ? "encontro selecionado" : "encontros selecionados";
  } else {
    bottomBar.classList.remove("visible");
  }
}

// ==========================================
// IDEIAS PERSONALIZADAS
// ==========================================

function setupEventListeners() {
  const addCustomBtn = document.getElementById("add-custom-btn");
  const customInput = document.getElementById("custom-date-input");
  const sendBtn = document.getElementById("send-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");

  // Adicionar ideia personalizada
  const addIdea = () => {
    const text = customInput.value.trim();
    if (text) {
      addCustomSuggestion(text);
      customInput.value = "";
    }
  };

  addCustomBtn.addEventListener("click", addIdea);
  customInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addIdea();
  });

  // Enviar/Salvar escolhas
  sendBtn.addEventListener("click", saveSelectionsAndConfirm);

  // Fechar modal de sucesso
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", hideSuccessModal);
  }
}

function addCustomSuggestion(text) {
  // Evitar duplicados
  if (appState.customSuggestions.includes(text)) return;

  appState.customSuggestions.push(text);
  
  const container = document.getElementById("custom-items-container");
  const tag = document.createElement("div");
  tag.className = "custom-tag";
  tag.innerHTML = `
    <span>✨ ${text}</span>
    <button class="custom-tag-remove" aria-label="Remover sugestão">
      <i data-lucide="x" style="width: 14px; height: 14px;"></i>
    </button>
  `;

  // Remover tag personalizada
  tag.querySelector(".custom-tag-remove").addEventListener("click", () => {
    appState.customSuggestions = appState.customSuggestions.filter(item => item !== text);
    tag.remove();
    updateBottomBar();
  });

  container.appendChild(tag);
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  updateBottomBar();
  
  // Efeito visual sutil ao adicionar
  const customCard = document.querySelector(".custom-date-card");
  createHeartBlast(customCard);
}

// ==========================================
// INTEGRAÇÃO COM WHATSAPP
// ==========================================
function saveSelectionsAndConfirm() {
  // Mapeia IDs para os títulos dos encontros
  const encontrosSelecionados = Array.from(appState.selecionados).map(id => {
    const match = OPCOES_ENCONTROS.find(o => o.id === id);
    return match ? `${match.icone} ${match.titulo}` : id;
  });

  // Adiciona as ideias personalizadas
  const customItems = appState.customSuggestions.map(text => `✨ ${text}`);
  const todosEncontros = [...encontrosSelecionados, ...customItems];

  if (todosEncontros.length === 0) return;

  const btn = document.getElementById("send-btn");
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span>Enviando respostas...</span> <i data-lucide="loader" class="icon-spin"></i>`;
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Prepara os dados para o envio de e-mail via FormSubmit
  const payload = {
    _subject: "Lista de Encontros Selecionados! 💖",
    _template: "box",
    _captcha: "false",
    "Encontros Selecionados": encontrosSelecionados.join("\n"),
    "Sugestões Extras": customItems.join("\n") || "Nenhuma",
    "Data/Hora do Envio": new Date().toLocaleString("pt-BR")
  };

  fetch("https://formsubmit.co/ajax/rfael4551@gmail.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success === "true" || result.success === true || (result.message && result.message.includes("Activation"))) {
      showSuccessModal();
    } else {
      alert("Houve um probleminha ao enviar. Tente novamente!");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Erro de conexão. Verifique sua rede e tente novamente!");
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  });
}

function showSuccessModal() {
  const modal = document.getElementById("success-modal");
  modal.classList.add("active");
}

function hideSuccessModal() {
  const modal = document.getElementById("success-modal");
  modal.classList.remove("active");
  
  // Limpar seleções após envio
  appState.selecionados.clear();
  appState.customSuggestions = [];
  document.getElementById("custom-items-container").innerHTML = "";
  document.querySelectorAll(".date-card.selected").forEach(card => card.classList.remove("selected"));
  updateBottomBar();
}

// ==========================================
// EFEITOS ESPECIAIS (PARTÍCULAS DO CANVAS)
// ==========================================

let canvas, ctx, particles = [];

function initParticles() {
  canvas = document.getElementById("particles-canvas");
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
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle(randomY = false) {
  const isHeart = Math.random() > 0.6; // Mistura de corações e círculos suaves
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
  // Top left curve
  ctx.bezierCurveTo(
    x - size / 2, y - size / 2, 
    x - size, y + topCurveHeight, 
    x, y + size
  );
  // Top right curve
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, index) => {
    p.y += p.speedY;
    p.x += p.speedX;

    if (p.type === "heart") {
      drawHeart(p.x, p.y, p.size, p.color, p.opacity);
    } else {
      drawBubble(p.x, p.y, p.size, p.color, p.opacity);
    }

    // Reseta partícula ao sair do topo
    if (p.y < -20) {
      particles[index] = createParticle(false);
    }
  });

  requestAnimationFrame(animateParticles);
}

// Blast de corações saindo de um elemento quando selecionado
function createHeartBlast(element) {
  const rect = element.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      particles.push({
        x: startX + (Math.random() * 40 - 20),
        y: startY + (Math.random() * 40 - 20),
        size: Math.random() * 10 + 6,
        speedY: -(Math.random() * 2 + 1.5),
        speedX: Math.random() * 4 - 2,
        opacity: 0.8,
        type: Math.random() > 0.3 ? "heart" : "bubble",
        color: Math.random() > 0.5 ? "#ff6b8b" : "#fcc419"
      });
      
      // Remove a partícula de blast após um tempo para não acumular
      setTimeout(() => {
        particles.shift();
      }, 2000);
    }, i * 50);
  }
}
