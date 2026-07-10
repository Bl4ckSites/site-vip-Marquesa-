// DETECÇÃO DE BOTS E SEGURANÇA
console.log('🔒 Sistema de segurança inicializado');

// Verificação de bot simples
function isBot() {
    const userAgent = navigator.userAgent.toLowerCase();
    const bots = [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 
        'wget', 'python-requests', 'java/', 'php/', 'ruby/'
    ];
    
    return bots.some(bot => userAgent.includes(bot));
}

// Verificação de headless browser (MAIS SUAVE)
function isHeadless() {
    // Apenas verifica webdriver (Selenium/Puppeteer)
    if (navigator.webdriver === true) {
        return true;
    }
    return false;
}

// Bloqueio de bots (APENAS bots óbvios)
if (isBot() || isHeadless()) {
    console.warn('️ Bot detectado - Acesso bloqueado');
    document.body.innerHTML = '<div style="background:#000;color:#333;height:100vh;display:flex;align-items:center;justify-content:center;font-family:Arial;"><h1>403 - Forbidden</h1></div>';
}

// VARIÁVEIS GLOBAIS DO SLIDER
let isDragging = false;
let startX = 0;
let currentX = 0;
let sliderButton = null;
let sliderTrack = null;
let maxSlide = 0;

// ABRIR MODAL
function openModal() {
    console.log('🔓 Modal de verificação aberto');
    const modal = document.getElementById('verification-modal');
    modal.classList.remove('hidden');
    initSlider();
}

// INICIALIZAR SLIDER
function initSlider() {
    sliderButton = document.getElementById('slider-button');
    sliderTrack = document.getElementById('slider-track');
    
    if (!sliderButton || !sliderTrack) {
        console.error('❌ Elementos do slider não encontrados');
        return;
    }
    
    maxSlide = sliderTrack.offsetWidth - sliderButton.offsetWidth;
    
    // Eventos de mouse
    sliderButton.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Eventos de touch (mobile)
    sliderButton.addEventListener('touchstart', startDrag, {passive: false});
    document.addEventListener('touchmove', drag, {passive: false});
    document.addEventListener('touchend', endDrag);
    
    console.log('✅ Slider inicializado');
}

// INICIAR ARRASTE
function startDrag(e) {
    isDragging = true;
    startX = getClientX(e);
    sliderButton.style.transition = 'none';
    console.log('👆 Arraste iniciado');
}

// ARRASTAR
function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    currentX = getClientX(e);
    let deltaX = currentX - startX;
    
    // Limitar movimento
    if (deltaX < 0) deltaX = 0;
    if (deltaX > maxSlide) deltaX = maxSlide;
    
    sliderButton.style.transform = `translateX(${deltaX}px)`;
    
    // Revelar foto ao arrastar 50%
    const profileReveal = document.getElementById('profile-reveal');
    const heartIcon = document.querySelector('.heart-icon');
    
    if (deltaX > maxSlide * 0.5) {
        if (profileReveal && heartIcon) {
            profileReveal.classList.add('show');
            heartIcon.style.opacity = '0';
        }
    }
    
    console.log(`📍 Posição: ${deltaX}px / ${maxSlide}px`);
}

// FINALIZAR ARRASTE
function endDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    const currentTransform = sliderButton.style.transform;
    const match = currentTransform.match(/translateX\((\d+)px\)/);
    const currentPosition = match ? parseInt(match[1]) : 0;
    
    console.log(`✋ Arraste finalizado em: ${currentPosition}px`);
    
    // Verificar se completou
    if (currentPosition >= maxSlide * 0.9) {
        console.log('✅ Verificação humana concluída!');
        verifyHuman();
    } else {
        // Voltar para posição inicial
        sliderButton.style.transition = 'transform 0.3s ease';
        sliderButton.style.transform = 'translateX(0px)';
        
        const profileReveal = document.getElementById('profile-reveal');
        const heartIcon = document.querySelector('.heart-icon');
        
        if (profileReveal && heartIcon) {
            profileReveal.classList.remove('show');
            heartIcon.style.opacity = '1';
        }
        console.log('❌ Verificação não completada - resetando');
    }
}

// OBTER POSIÇÃO X (mouse ou touch)
function getClientX(e) {
    return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
}

// VERIFICAÇÃO HUMANA COM TOKEN
function verifyHuman() {
    // Gerar token único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const SECRET_KEY = 'minha_chave_secreta_2026_mude_isso';
    const data = `${timestamp}-${random}-${SECRET_KEY}`;
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    const token = btoa(`${timestamp}:${hash.toString(36)}`);
    
    // Salvar token
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('verifiedTime', timestamp);
    
    console.log('💾 Token gerado e armazenado');
    
    // Fechar modal com animação
    const modal = document.getElementById('verification-modal');
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        modal.classList.add('hidden');
        console.log('🔄 Redirecionando para links.html...');
        window.location.href = `links.html?t=${encodeURIComponent(token)}`;
    }, 300);
}

// PROTEÇÕES ADICIONAIS
document.addEventListener('contextmenu', function(e) {
    console.log('️ Clique direito bloqueado');
    e.preventDefault();
});

document.addEventListener('selectstart', function(e) {
    if (e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
});

document.addEventListener('keydown', function(e) {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
    ) {
        console.warn('⚠️ Tentativa de inspeção detectada');
        e.preventDefault();
    }
});

// LOG DE ERROS
window.addEventListener('error', function(e) {
    console.error('❌ Erro capturado:', e.message);
    console.error('📍 Linha:', e.lineno, 'Coluna:', e.colno);
});

console.log('✅ Todos os scripts carregados com sucesso');
