(() => {
    'use strict';
    document.documentElement.classList.add('js');

    const $ = (s, el = document) => el.querySelector(s);
    const $$ = (s, el = document) => [...el.querySelectorAll(s)];
    const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Menu para celular
    const header = $('header');
    const menuBtn = $('.menu-btn');
    const menu = $('#menu');
    const fechaMenu = () => {
        menu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
    };
    menuBtn.addEventListener('click', () => {
        const aberto = menu.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(aberto));
    });
    $$('#menu a').forEach(a => a.addEventListener('click', fechaMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fechaMenu(); });

    // 2. Sombra na barra ao rolar a página
    const aoRolar = () => header.classList.toggle('scrolled', window.scrollY > 10);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });

    // 3. Link ativo conforme a seção visível
    const links = $$('#menu a');
    const obsAtivo = new IntersectionObserver(entradas => {
        entradas.forEach(e => {
            if (e.isIntersecting) {
                links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.map(a => $(a.getAttribute('href'))).filter(Boolean).forEach(s => obsAtivo.observe(s));

    // 4. Efeito de digitação no subtítulo
    const sub = $('.sub_titulo');
    const textoSub = sub.dataset.text || sub.textContent.trim();
    if (!reduzMovimento) {
        sub.textContent = '';
        sub.classList.add('digitando');
        let i = 0;
        const digita = () => {
            sub.textContent = textoSub.slice(0, ++i);
            if (i < textoSub.length) setTimeout(digita, 110);
            else sub.classList.remove('digitando');
        };
        setTimeout(digita, 400);
    }

    // 6. Seções aparecem suavemente ao rolar
    const revelaveis = $$('.reveal');
    if (reduzMovimento || !('IntersectionObserver' in window)) {
        revelaveis.forEach(el => el.classList.add('visible'));
    } else {
        const obs = new IntersectionObserver((entradas, o) => {
            entradas.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); o.unobserve(e.target); }
            });
        }, { threshold: 0.15 });
        revelaveis.forEach(el => obs.observe(el));
    }

    // 7. Lista de desejos do merch (salva no navegador)
    const CHAVE = 'mgk-favoritos';
    let favoritos = [];
    try { favoritos = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch (_) { favoritos = []; }
    const contador = $('#contador');
    const atualizaContador = () => { contador.textContent = favoritos.length; };
    $$('.card-merch').forEach(card => {
        const id = card.dataset.id;
        const btn = $('.fav', card);
        const pinta = () => {
            const ativo = favoritos.includes(id);
            btn.classList.toggle('on', ativo);
            btn.setAttribute('aria-pressed', String(ativo));
            btn.textContent = ativo ? '♥ Na lista' : '♡ Quero';
        };
        btn.addEventListener('click', () => {
            favoritos = favoritos.includes(id) ? favoritos.filter(f => f !== id) : [...favoritos, id];
            try { localStorage.setItem(CHAVE, JSON.stringify(favoritos)); } catch (_) { /* ignora */ }
            pinta();
            atualizaContador();
        });
        pinta();
    });
    atualizaContador();

    // 8. Validação dos formulários
    const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const configuraForm = (seletor, valida, sucesso) => {
        const form = $(seletor);
        const msg = $('.msg', form);
        form.addEventListener('submit', e => {
            e.preventDefault();
            const erro = valida(new FormData(form));
            msg.className = 'msg ' + (erro ? 'erro' : 'ok');
            msg.textContent = erro || sucesso;
            if (!erro) form.reset();
        });
    };
    configuraForm('#form-tickets',
        d => emailOk(String(d.get('email')).trim()) ? '' : 'Digite um e-mail válido.',
        'Pronto! Avisaremos quando os ingressos saírem. (demonstração)');
    configuraForm('#form-contato', d => {
        if (String(d.get('nome')).trim().length < 2) return 'Informe seu nome.';
        if (!emailOk(String(d.get('email')).trim())) return 'Digite um e-mail válido.';
        if (String(d.get('mensagem')).trim().length < 10) return 'A mensagem precisa ter ao menos 10 caracteres.';
        return '';
    }, 'Mensagem enviada! (demonstração: nada é enviado de verdade)');

    // 9. Ano atual no rodapé
    $('#ano').textContent = new Date().getFullYear();
})();
