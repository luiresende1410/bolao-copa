'use strict';
// ============================================================
// 🔧 CONFIGURAÇÃO FIREBASE
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyARFb_wc3hfw5asVQE_GAkVWezwApPbri4",
    authDomain: "bolao-copa-2026-33133.firebaseapp.com",
    databaseURL: "https://bolao-copa-2026-33133-default-rtdb.firebaseio.com",
    projectId: "bolao-copa-2026-33133",
    storageBucket: "bolao-copa-2026-33133.firebasestorage.app",
    messagingSenderId: "676467254871",
    appId: "1:676467254871:web:36795d964f5f4f8b5b2512"
};
// ============================================================

// ===== UTILITÁRIOS =====
function $(id) { return document.getElementById(id); }

function toast(msg, type = 'success') {
    const container = $('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    el.setAttribute('role', 'alert');
    container.appendChild(el);
    setTimeout(() => { el.remove(); }, 3000);
}

// Escapa TODOS os caracteres perigosos em HTML (texto E atributos).
// Isso impede tanto XSS via innerHTML quanto "fuga" de atributos onclick="..."
// quando um nome de apostador/grupo/time contém aspas simples ou duplas.
function sanitize(str) {
    return String(str).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

// ===== HASH DE SENHA (PBKDF2 com salt por senha) =====
// Formato armazenado: "pbkdf2$<iterações>$<saltHex>$<hashHex>"
// Mantém compatibilidade com hashes antigos (SHA-256 puro, 64 hex chars, sem salt)
// para não invalidar contas já cadastradas.
const PBKDF2_ITERATIONS = 150000;

function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomSaltHex(bytes = 16) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return bufferToHex(arr);
}

function pbkdf2Hash(password, saltHex, iterations = PBKDF2_ITERATIONS) {
    const encoder = new TextEncoder();
    const saltBytes = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
    return crypto.subtle.importKey('raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
        .then(keyMaterial => crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
            keyMaterial, 256
        ))
        .then(bits => bufferToHex(bits));
}

// Gera um novo hash (sempre no formato forte) para salvar uma senha nova/alterada.
function hashPassword(password) {
    if (!(window.crypto && window.crypto.subtle)) {
        // Fallback extremamente raro (navegador sem SubtleCrypto)
        return Promise.resolve('legacy$' + hashFallback(password));
    }
    const saltHex = randomSaltHex();
    return pbkdf2Hash(password, saltHex).then(hashHex => `pbkdf2$${PBKDF2_ITERATIONS}$${saltHex}$${hashHex}`);
}

// Verifica uma senha digitada contra o valor armazenado, suportando os 3 formatos
// possíveis: pbkdf2$..., legacy$... (fallback antigo) e SHA-256 puro sem salt (contas antigas).
function verifyPassword(password, stored) {
    if (!stored) return Promise.resolve(false);

    if (stored.startsWith('pbkdf2$')) {
        const [, iterStr, saltHex, hashHex] = stored.split('$');
        return pbkdf2Hash(password, saltHex, parseInt(iterStr, 10)).then(computed => computed === hashHex);
    }

    if (stored.startsWith('legacy$')) {
        return Promise.resolve(hashFallback(password) === stored.slice('legacy$'.length));
    }

    // Formato antigo: SHA-256 puro sem salt (64 caracteres hex)
    if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        return crypto.subtle.digest('SHA-256', encoder.encode(password)).then(buffer => bufferToHex(buffer) === stored);
    }
    return Promise.resolve(hashFallback(password) === stored);
}

function hashFallback(str) {
    // Fallback mais seguro com múltiplas passagens (só usado sem SubtleCrypto)
    let hash1 = 0, hash2 = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash1 = ((hash1 << 5) - hash1 + char) | 0;
        hash2 = ((hash2 << 7) ^ char) + (hash1 >>> 3) | 0;
    }
    // Segunda passagem para difusão
    for (let i = 0; i < 100; i++) {
        hash1 = ((hash1 << 5) - hash1 + hash2) | 0;
        hash2 = ((hash2 << 7) ^ hash1) | 0;
    }
    return Math.abs(hash1).toString(36) + Math.abs(hash2).toString(36);
}

// Validação de entrada
function validateInput(value, maxLength = 30) {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > maxLength) return false;
    // Bloqueia caracteres perigosos para paths do Firebase
    if (/[.#$\[\]\/]/.test(trimmed)) return false;
    return true;
}

function validateScore(value) {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && num <= 99;
}

// Verifica se foi configurado
if (firebaseConfig.apiKey === "COLE_AQUI") {
    $('setup-screen').style.display = 'block';
} else {
    $('app-screen').style.display = 'block';
    firebase.initializeApp(firebaseConfig);
    // Autenticação anônima: exige que o cliente tenha uma sessão válida do Firebase Auth
    // antes de ler/escrever no Realtime Database. Combinada com as regras em
    // firebase-rules.json (".write": "auth != null"), isso impede que alguém escreva
    // dados direto via REST sem nunca ter carregado a página/SDK do Firebase.
    // Não substitui a verificação de senha (que continua sendo client-side), mas fecha
    // a porta de escrita anônima irrestrita.
    firebase.auth().signInAnonymously().then(initApp).catch(err => {
        toast('Erro ao conectar: ' + err.message, 'error');
    });
}

// Estrelas decorativas
(function createStars() {
    const container = $('stars');
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 4 + 2;
        star.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${Math.random()*0.2+0.05}`;
        fragment.appendChild(star);
    }
    container.appendChild(fragment);
})();

// ===== ESTADO =====
let apostadores = {};
let adminPass = '';
let results = {};
let palpites = {};
let loggedUser = '';
let loggedAsAdmin = false;
let adminCallback = null;
let knockoutTeams = {};
let grupos = {};
let apostadorGrupos = {};
// Guarda quem avançou em caso de empate no tempo normal — cobre tanto prorrogação
// quanto pênaltis (o app não distingue as duas, é só "quem passou de fase").
let penaltis = {};
let isAdminAuthenticated = false; // Flag de sessão admin

// ===== INIT =====
function initApp() {
    const db = firebase.database();
    db.ref('admin').on('value', snap => { adminPass = snap.val() || ''; updateAdminStatus(); });
    db.ref('apostadores').on('value', snap => { apostadores = snap.val() || {}; renderApostadores(); updateApostadorSelect(); });
    db.ref('results').on('value', snap => { results = snap.val() || {}; renderMatches(); calcularRanking(); renderBracket(); autoAdvanceTeams(results); });
    db.ref('palpites').on('value', snap => { palpites = snap.val() || {}; calcularRanking(); });
    db.ref('grupos').on('value', snap => { grupos = snap.val() || {}; renderGrupos(); updateGrupoSelects(); });
    db.ref('apostadorGrupos').on('value', snap => { apostadorGrupos = snap.val() || {}; renderApostadores(); calcularRanking(); });
    db.ref('penaltis').on('value', snap => { penaltis = snap.val() || {}; renderMatches(); renderBracket(); autoAdvanceTeams(results); });
    db.ref('knockoutTeams').on('value', snap => {
        knockoutTeams = snap.val() || {};
        knockoutMatches.forEach(m => {
            if (knockoutTeams[m.id]) {
                m.home = knockoutTeams[m.id].home || 'A definir';
                m.away = knockoutTeams[m.id].away || 'A definir';
            }
        });
        renderMatches();
        renderBracket();
    });
}

// ===== NAVEGAÇÃO =====
function showSection(id, clickedTab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });
    $(id).classList.add('active');
    if (clickedTab) {
        clickedTab.classList.add('active');
        clickedTab.setAttribute('aria-selected', 'true');
    }
    if (id === 'palpites') clearPalpitesView();
    if (id === 'classificacao') calcularRanking();
    if (id === 'chaveamento') renderBracket();
}

// Navegação por teclado nas tabs
document.addEventListener('DOMContentLoaded', () => {
    const tablist = document.querySelector('[role="tablist"]');
    if (!tablist) return;
    tablist.addEventListener('keydown', e => {
        const tabs = [...tablist.querySelectorAll('[role="tab"]')];
        const idx = tabs.indexOf(document.activeElement);
        if (idx === -1) return;
        let newIdx = idx;
        if (e.key === 'ArrowRight') newIdx = (idx + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') newIdx = (idx - 1 + tabs.length) % tabs.length;
        else return;
        e.preventDefault();
        tabs[newIdx].focus();
        tabs[newIdx].click();
    });
});

// ===== ADMIN =====
function setAdminPassword() {
    const input = $('admin-senha-input');
    const pass = input.value.trim();
    if (!pass) { toast('Digite uma senha!', 'warning'); return; }
    if (pass.length < 4) { toast('Senha muito curta (mín 4 caracteres)!', 'warning'); return; }
    hashPassword(pass).then(hashed => {
        firebase.database().ref('admin').set(hashed);
        input.value = '';
        toast('Senha admin definida!');
    });
}

function updateAdminStatus() {
    const el = $('admin-status');
    if (el) el.textContent = adminPass ? '✅ Senha admin configurada' : '⚠️ Nenhuma senha admin definida';
}

function requestAdminAction(callback) {
    if (!adminPass) { toast('Defina a senha admin primeiro (aba Apostadores)!', 'warning'); return; }
    // Se já autenticado nesta sessão, executa direto
    if (isAdminAuthenticated) {
        callback();
        return;
    }
    adminCallback = callback;
    $('modal-admin-input').value = '';
    $('modal-admin').classList.add('show');
    setTimeout(() => $('modal-admin-input').focus(), 100);
}

function confirmAdmin() {
    const input = $('modal-admin-input').value;
    if (!input) { toast('Digite a senha!', 'warning'); return; }
    verifyPassword(input, adminPass).then(ok => {
        if (ok) {
            isAdminAuthenticated = true;
            closeModal();
            if (adminCallback) adminCallback();
        } else {
            toast('Senha incorreta!', 'error');
            $('modal-admin-input').value = '';
            $('modal-admin-input').focus();
        }
    });
}

function closeModal() {
    $('modal-admin').classList.remove('show');
}

// Fechar modal com Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
        document.querySelectorAll('[id^="modal-edit"], [id^="modal-change"], [id^="modal-knockout"], [id^="modal-resumo"]').forEach(m => {
            if (m.classList.contains('show')) m.remove();
        });
    }
});

// ===== FUNÇÕES AUXILIARES DE RENDER =====
function groupMatchesByDate(matchList) {
    const dateGroups = {};
    matchList.forEach(m => {
        if (!dateGroups[m.date]) dateGroups[m.date] = [];
        dateGroups[m.date].push(m);
    });
    return Object.keys(dateGroups).sort((a, b) => {
        const [dA, mA] = a.split('/').map(Number);
        const [dB, mB] = b.split('/').map(Number);
        return (mA * 100 + dA) - (mB * 100 + dB);
    }).map(date => ({ date, matches: dateGroups[date] }));
}

function getDateLabel(date) {
    const [dia, mes] = date.split('/');
    return `${dia} de ${MESES[parseInt(mes)]}`;
}

function getMatchLabel(m) {
    if (m.group) return `<span style="font-size:0.65em; color:var(--cor-texto-muted); background:rgba(255,255,255,0.08); padding:1px 6px; border-radius:10px;">Grupo ${m.group}</span>`;
    return `<span style="font-size:0.65em; color:var(--cor-dourado); background:rgba(247,217,23,0.1); padding:1px 6px; border-radius:10px;">${phaseNames[m.phase] || ''}</span>`;
}

// ===== RESULTADOS =====
function renderMatches() {
    const container = $('matches-container');
    if (!container) return;
    const grouped = groupMatchesByDate([...groupMatches, ...knockoutMatches]);
    let html = '';

    grouped.forEach(({ date, matches: dayMatches }) => {
        const label = getDateLabel(date);
        const dateId = 'rd_' + date.replace('/', '');
        html += `<div class="card">
            <div class="group-title" onclick="toggleGroup('${dateId}', this)" role="button" tabindex="0" aria-expanded="false" aria-controls="${dateId}" onkeypress="if(event.key==='Enter')this.click()">
                <span>📅 ${label}</span>
                <span class="arrow collapsed" aria-hidden="true">▼</span>
            </div>
            <div class="group-matches collapsed" id="${dateId}" role="region">`;
        dayMatches.forEach(m => {
            const r = results[m.id] || results[String(m.id)];
            const rH = r ? r.home : '';
            const rA = r ? r.away : '';
            const timeLabel = m.time ? `<span style="font-size:0.7em; color:var(--cor-texto-suave);">🕐 ${m.time}</span>` : '';

            // Verifica se é mata-mata e se precisa mostrar seletor de pênaltis
            let penaltisHtml = '';
            if (!m.group && rH !== '' && rA !== '' && Number(rH) === Number(rA)) {
                const pen = penaltis[m.id] || penaltis[String(m.id)] || '';
                const homeSelected = pen === 'home' ? 'selected' : '';
                const awaySelected = pen === 'away' ? 'selected' : '';
                penaltisHtml = `
                <div class="penaltis-row">
                    <span>⚡ Prorrogação/Pênaltis, quem avançou?</span>
                    <button class="penaltis-btn ${homeSelected}" onclick="setPenalti(${m.id}, 'home', this)" aria-label="Avançou ${sanitize(m.home)}">${sanitize(m.home.split(' ').pop())}</button>
                    <button class="penaltis-btn ${awaySelected}" onclick="setPenalti(${m.id}, 'away', this)" aria-label="Avançou ${sanitize(m.away)}">${sanitize(m.away.split(' ').pop())}</button>
                </div>`;
            }

            html += `
            <div class="match">
                <div class="match-info">
                    <span class="match-home">${sanitize(m.home)}</span>
                    <div class="match-score">
                        <input type="number" min="0" max="99" id="rh_${m.id}" value="${rH}" placeholder="-" aria-label="Gols ${sanitize(m.home)}">
                        <span class="x" aria-hidden="true">✕</span>
                        <input type="number" min="0" max="99" id="ra_${m.id}" value="${rA}" placeholder="-" aria-label="Gols ${sanitize(m.away)}">
                    </div>
                    <span class="match-away">${sanitize(m.away)}</span>
                </div>
                <span class="match-date">${timeLabel} ${getMatchLabel(m)}</span>
                ${penaltisHtml}
            </div>`;
        });
        html += '</div></div>';
    });

    container.innerHTML = html;
}

function toggleGroup(id, titleEl) {
    const el = $(id);
    const arrow = titleEl.querySelector('.arrow');
    const isCollapsed = el.classList.contains('collapsed');
    el.classList.toggle('collapsed');
    arrow.classList.toggle('collapsed');
    titleEl.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
}

// CORRIGIDO: setPenalti agora exige autenticação admin
function setPenalti(matchId, side, btnEl) {
    requestAdminAction(() => {
        const current = penaltis[matchId] || penaltis[String(matchId)] || '';
        const newValue = (current === side) ? '' : side;

        // Atualiza visual imediato
        const row = btnEl.parentElement;
        row.querySelectorAll('.penaltis-btn').forEach(b => b.classList.remove('selected'));
        if (newValue) btnEl.classList.add('selected');

        if (newValue) {
            firebase.database().ref('penaltis/' + matchId).set(newValue);
        } else {
            firebase.database().ref('penaltis/' + matchId).remove();
        }
        toast('Avanço na prorrogação/pênaltis atualizado!');
    });
}

// Palpite de pênaltis do apostador (salva localmente até o savePalpites)
let palpitePenaltis = {};

function setPalpitePenalti(matchId, side, btnEl) {
    const current = palpitePenaltis[matchId] || '';
    const newValue = (current === side) ? '' : side;
    palpitePenaltis[matchId] = newValue;

    const row = btnEl.parentElement;
    row.querySelectorAll('.penaltis-btn').forEach(b => b.classList.remove('selected'));
    if (newValue) btnEl.classList.add('selected');
}

function saveResults() {
    const data = {};
    let count = 0;
    allMatches.forEach(m => {
        const hEl = $(`rh_${m.id}`);
        const aEl = $(`ra_${m.id}`);
        if (hEl && aEl && hEl.value !== '' && aEl.value !== '') {
            const hVal = parseInt(hEl.value);
            const aVal = parseInt(aEl.value);
            // Validação de score
            if (!validateScore(hEl.value) || !validateScore(aEl.value)) return;
            data[m.id] = { home: hVal, away: aVal };
            count++;
        }
    });
    firebase.database().ref('results').set(data).then(() => {
        toast(`Resultados salvos! (${count} jogos)`);
        autoAdvanceTeams(data);
    }).catch(err => {
        toast('Erro ao salvar resultados: ' + err.message, 'error');
    });
}

// ===== AVANÇO AUTOMÁTICO NO MATA-MATA =====
function getWinnerAndLoser(matchId, resultsData) {
    const r = resultsData[matchId] || resultsData[String(matchId)];
    if (!r || r.home === '' || r.away === '') return { winner: null, loser: null };
    const m = allMatches.find(x => x.id === Number(matchId));
    if (!m) return { winner: null, loser: null };
    const homeGoals = Number(r.home);
    const awayGoals = Number(r.away);
    if (isNaN(homeGoals) || isNaN(awayGoals)) return { winner: null, loser: null };

    if (homeGoals > awayGoals) {
        return { winner: m.home, loser: m.away };
    } else if (awayGoals > homeGoals) {
        return { winner: m.away, loser: m.home };
    } else {
        const pen = penaltis[matchId] || penaltis[String(matchId)];
        if (pen === 'home') return { winner: m.home, loser: m.away };
        if (pen === 'away') return { winner: m.away, loser: m.home };
        return { winner: null, loser: null };
    }
}

function autoAdvanceTeams(resultsData) {
    const updates = {};
    let changed = false;

    Object.keys(advanceMap).forEach(srcIdStr => {
        const srcId = Number(srcIdStr);
        const mapping = advanceMap[srcId];
        const { winner, loser } = getWinnerAndLoser(srcId, resultsData);

        if (winner) {
            if (mapping.nextWin) {
                const currentWin = knockoutTeams[mapping.nextWin] || {};
                if (currentWin[mapping.slotWin] !== winner) {
                    if (!updates[mapping.nextWin]) updates[mapping.nextWin] = knockoutTeams[mapping.nextWin] || {};
                    updates[mapping.nextWin][mapping.slotWin] = winner;
                    changed = true;
                }
                if (loser && mapping.nextLose) {
                    const currentLose = knockoutTeams[mapping.nextLose] || {};
                    if (currentLose[mapping.slotLose] !== loser) {
                        if (!updates[mapping.nextLose]) updates[mapping.nextLose] = knockoutTeams[mapping.nextLose] || {};
                        updates[mapping.nextLose][mapping.slotLose] = loser;
                        changed = true;
                    }
                }
            } else {
                const current = knockoutTeams[mapping.next] || {};
                if (current[mapping.slot] !== winner) {
                    if (!updates[mapping.next]) updates[mapping.next] = knockoutTeams[mapping.next] || {};
                    updates[mapping.next][mapping.slot] = winner;
                    changed = true;
                }
            }
        }
    });

    if (changed) {
        const finalData = { ...knockoutTeams };
        Object.keys(updates).forEach(id => {
            finalData[id] = { ...finalData[id], ...updates[id] };
        });
        firebase.database().ref('knockoutTeams').set(finalData).then(() => {
            toast('Times avançados automaticamente! ⚽', 'success');
        });
    }
}

// ===== APOSTADORES =====
function addApostador() {
    const nome = $('novo-nome').value.trim();
    const senha = $('novo-senha').value.trim();
    const grupo = $('novo-grupo').value;
    if (!nome) { toast('Digite um nome!', 'warning'); return; }
    if (!senha) { toast('Digite uma senha!', 'warning'); return; }
    if (!validateInput(nome, 30)) { toast('Nome inválido (máx 30 caracteres, sem caracteres especiais)!', 'warning'); return; }
    if (senha.length < 3) { toast('Senha muito curta (mín 3 caracteres)!', 'warning'); return; }
    if (apostadores[nome]) { toast('Nome já existe!', 'error'); return; }

    hashPassword(senha).then(hashed => {
        const db = firebase.database();
        db.ref('apostadores/' + nome).set(hashed);
        if (grupo) db.ref('apostadorGrupos/' + nome).set(grupo);
        $('novo-nome').value = '';
        $('novo-senha').value = '';
        $('novo-grupo').value = '';
        toast(`${nome} cadastrado(a)!`);
    });
}

function removeApostador(nome) {
    if (!adminPass) { toast('Defina a senha admin!', 'warning'); return; }
    requestAdminAction(() => {
        if (!confirm(`Remover "${nome}" e todos os palpites? Esta ação não pode ser desfeita.`)) return;
        const db = firebase.database();
        const updates = {};
        updates['apostadores/' + nome] = null;
        updates['palpites/' + nome] = null;
        updates['apostadorGrupos/' + nome] = null;
        db.ref().update(updates).then(() => toast(`${nome} removido.`));
    });
}

function editApostador(nome) {
    if (!adminPass) { toast('Defina a senha admin!', 'warning'); return; }
    requestAdminAction(() => {
        const grupoAtual = apostadorGrupos[nome] || '';
        const grupoOptions = Object.keys(grupos).map(g =>
            `<option value="${sanitize(g)}" ${g === grupoAtual ? 'selected' : ''}>${sanitize(g)}</option>`
        ).join('');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay show';
        overlay.id = 'modal-edit-apostador';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = `
        <div class="modal">
            <h3>✏️ Editar: ${sanitize(nome)}</h3>
            <label style="color:var(--cor-texto-suave); font-size:0.82em; display:block; margin-bottom:4px;">Novo nome:</label>
            <input type="text" id="edit-nome" value="${sanitize(nome)}" aria-label="Novo nome do apostador">
            <label style="color:var(--cor-texto-suave); font-size:0.82em; display:block; margin-bottom:4px;">Nova senha (vazio = manter atual):</label>
            <input type="text" id="edit-senha" placeholder="Nova senha..." aria-label="Nova senha">
            <label style="color:var(--cor-texto-suave); font-size:0.82em; display:block; margin-bottom:4px;">Grupo:</label>
            <select id="edit-grupo" style="width:100%; padding:10px; border:1px solid var(--cor-input-borda); border-radius:var(--radius-sm); background:var(--cor-input-bg); color:var(--cor-texto); font-size:1em; margin-bottom:12px;">
                <option value="">Sem grupo</option>
                ${grupoOptions}
            </select>
            <div class="modal-btns">
                <button class="btn-gray" onclick="document.getElementById('modal-edit-apostador').remove()">Cancelar</button>
                <button class="btn-green" onclick="saveEditApostador('${sanitize(nome)}')">Salvar</button>
            </div>
        </div>`;
        document.body.appendChild(overlay);
        setTimeout(() => $('edit-nome').focus(), 100);
    });
}

function saveEditApostador(nomeOriginal) {
    const novoNome = $('edit-nome').value.trim();
    const novaSenha = $('edit-senha').value.trim();
    const novoGrupo = $('edit-grupo').value;

    if (!novoNome) { toast('O nome não pode ficar vazio!', 'warning'); return; }
    if (!validateInput(novoNome, 30)) { toast('Nome inválido (máx 30 caracteres, sem caracteres especiais)!', 'warning'); return; }

    const db = firebase.database();
    const doSave = (hashedSenha) => {
        if (novoNome !== nomeOriginal) {
            if (apostadores[novoNome]) { toast('Já existe um apostador com esse nome!', 'error'); return; }
            const palpitesAntigos = palpites[nomeOriginal] || null;
            const updates = {};
            updates['apostadores/' + nomeOriginal] = null;
            updates['palpites/' + nomeOriginal] = null;
            updates['apostadorGrupos/' + nomeOriginal] = null;
            updates['apostadores/' + novoNome] = hashedSenha || apostadores[nomeOriginal];
            if (palpitesAntigos) updates['palpites/' + novoNome] = palpitesAntigos;
            if (novoGrupo) updates['apostadorGrupos/' + novoNome] = novoGrupo;
            db.ref().update(updates).then(() => {
                $('modal-edit-apostador').remove();
                toast('Apostador atualizado!');
            });
        } else {
            if (hashedSenha) db.ref('apostadores/' + nomeOriginal).set(hashedSenha);
            if (novoGrupo) db.ref('apostadorGrupos/' + nomeOriginal).set(novoGrupo);
            else db.ref('apostadorGrupos/' + nomeOriginal).remove();
            $('modal-edit-apostador').remove();
            toast('Apostador atualizado!');
        }
    };

    if (novaSenha) {
        hashPassword(novaSenha).then(doSave);
    } else {
        doSave(null);
    }
}

function renderApostadores() {
    const list = $('apostador-list');
    if (!list) return;
    const nomes = Object.keys(apostadores);
    if (nomes.length === 0) {
        list.innerHTML = '<span style="color:var(--cor-texto-muted); font-size:0.85em;">Nenhum apostador cadastrado</span>';
        return;
    }
    list.innerHTML = nomes.map(a => {
        const grupo = apostadorGrupos[a] ? `<span style="font-size:0.7em; opacity:0.8;">[${sanitize(apostadorGrupos[a])}]</span>` : '';
        return `<span class="apostador-tag">${sanitize(a)} ${grupo}
            <button class="remove" onclick="editApostador('${sanitize(a)}')" title="Editar ${sanitize(a)}" aria-label="Editar ${sanitize(a)}">✏️</button>
            <button class="remove" onclick="removeApostador('${sanitize(a)}')" title="Remover ${sanitize(a)}" aria-label="Remover ${sanitize(a)}">✕</button>
        </span>`;
    }).join('');
}

function updateApostadorSelect() {
    const select = $('apostador-select');
    if (!select) return;
    const nomes = Object.keys(apostadores).sort();
    select.innerHTML = '<option value="">-- Apostador --</option>' + nomes.map(a => `<option value="${sanitize(a)}">${sanitize(a)}</option>`).join('');
}

// ===== GRUPOS =====
function addGrupo() {
    const input = $('novo-grupo-nome');
    const nome = input.value.trim();
    if (!nome) { toast('Digite o nome do grupo!', 'warning'); return; }
    if (!validateInput(nome, 25)) { toast('Nome do grupo inválido (máx 25 caracteres, sem caracteres especiais)!', 'warning'); return; }
    if (grupos[nome]) { toast('Grupo já existe!', 'error'); return; }
    firebase.database().ref('grupos/' + nome).set(true).then(() => {
        input.value = '';
        toast(`Grupo "${nome}" criado!`);
    });
}

function removeGrupo(nome) {
    if (!adminPass) { toast('Defina a senha admin!', 'warning'); return; }
    requestAdminAction(() => {
        if (!confirm(`Remover grupo "${nome}"?`)) return;
        firebase.database().ref('grupos/' + nome).remove();
        Object.keys(apostadorGrupos).forEach(ap => {
            if (apostadorGrupos[ap] === nome) {
                firebase.database().ref('apostadorGrupos/' + ap).remove();
            }
        });
        toast(`Grupo "${nome}" removido.`);
    });
}

function renderGrupos() {
    const list = $('grupos-list');
    if (!list) return;
    const nomes = Object.keys(grupos);
    if (nomes.length === 0) {
        list.innerHTML = '<span style="color:var(--cor-texto-muted); font-size:0.85em;">Nenhum grupo criado</span>';
        return;
    }
    list.innerHTML = nomes.map(g =>
        `<span class="apostador-tag" style="background:#6c5ce7;">${sanitize(g)} <button class="remove" onclick="removeGrupo('${sanitize(g)}')" aria-label="Remover grupo ${sanitize(g)}">✕</button></span>`
    ).join('');
}

function updateGrupoSelects() {
    const nomes = Object.keys(grupos);
    const selectCadastro = $('novo-grupo');
    if (selectCadastro) {
        selectCadastro.innerHTML = '<option value="">Sem grupo</option>' + nomes.map(g => `<option value="${sanitize(g)}">${sanitize(g)}</option>`).join('');
    }
    const selectRanking = $('ranking-filtro-grupo');
    if (selectRanking) {
        selectRanking.innerHTML = '<option value="">🌍 Todos os apostadores</option>' + nomes.map(g => `<option value="${sanitize(g)}">👥 ${sanitize(g)}</option>`).join('');
    }
}

// ===== PALPITES =====
function clearPalpitesView() {
    $('palpites-container').innerHTML = '';
    $('palpites-actions').style.display = 'none';
    $('palpites-status').innerHTML = '';
    $('palpite-senha').value = '';
    loggedUser = '';
    loggedAsAdmin = false;
}

function loginPalpites() {
    const nome = $('apostador-select').value;
    const senha = $('palpite-senha').value;
    if (!nome) { toast('Selecione um apostador!', 'warning'); return; }
    if (!senha) { toast('Digite a senha!', 'warning'); return; }

    Promise.all([
        verifyPassword(senha, adminPass),
        verifyPassword(senha, apostadores[nome])
    ]).then(([isAdminMatch, isUserMatch]) => {
        const isAdmin = isAdminMatch && adminPass !== '';
        if (!isAdmin && !isUserMatch) {
            toast('Senha incorreta!', 'error');
            return;
        }

        loggedUser = nome;
        loggedAsAdmin = isAdmin;

        if (isAdmin) {
            $('palpites-status').innerHTML = `<div class="status-msg status-ok">✅ Editando palpites de <strong>${sanitize(nome)}</strong> como ADMIN</div>`;
        } else {
            $('palpites-status').innerHTML = `<div class="status-msg status-ok">✅ Logado como <strong>${sanitize(nome)}</strong> — Jogos bloqueiam 10min antes</div>`;
        }
        renderPalpites(nome);
        $('palpites-actions').style.display = 'flex';
    });
}

function renderPalpites(nome) {
    const container = $('palpites-container');
    const pp = palpites[nome] || {};
    const grouped = groupMatchesByDate([...groupMatches, ...knockoutMatches]);
    let html = '';
    let totalPreenchidos = 0;
    const totalJogos = allMatches.length;

    // Carregar palpites de pênaltis existentes
    palpitePenaltis = {};
    Object.keys(pp).forEach(mid => {
        const p = pp[mid];
        if (p && p.penalti) palpitePenaltis[mid] = p.penalti;
    });

    grouped.forEach(({ date, matches: dayMatches }) => {
        const label = getDateLabel(date);
        const dateId = 'pd_' + date.replace('/', '');
        html += `<div class="card">
            <div class="group-title" onclick="toggleGroup('${dateId}', this)" role="button" tabindex="0" aria-expanded="false" aria-controls="${dateId}" onkeypress="if(event.key==='Enter')this.click()">
                <span>📅 ${label}</span>
                <span class="arrow collapsed" aria-hidden="true">▼</span>
            </div>
            <div class="group-matches collapsed" id="${dateId}" role="region">`;
        dayMatches.forEach(m => {
            const p = pp[m.id] || pp[String(m.id)];
            const pH = p ? p.home : '';
            const pA = p ? p.away : '';
            if (pH !== '' && pA !== '') totalPreenchidos++;
            const timeLabel = m.time ? `<span style="font-size:0.7em; color:var(--cor-texto-suave);">🕐 ${m.time}</span>` : '';
            const locked = !loggedAsAdmin && isMatchLocked(m);
            const lockAttr = locked ? 'disabled' : '';
            const lockIcon = locked ? '<span style="font-size:0.65em; color:var(--cor-erro);">🔒 Encerrado</span> ' : '';

            let penPalpiteHtml = '';
            if (!m.group) {
                const penChoice = palpitePenaltis[m.id] || palpitePenaltis[String(m.id)] || '';
                const homeSelP = penChoice === 'home' ? 'selected' : '';
                const awaySelP = penChoice === 'away' ? 'selected' : '';
                const disabledP = locked ? 'disabled' : '';
                penPalpiteHtml = `
                <div class="penaltis-row" style="background:rgba(30,136,229,0.1); border-color:rgba(30,136,229,0.3);">
                    <span style="color:var(--cor-azul);">⚡ Se prorrogação ou pênaltis, quem avança?</span>
                    <button class="penaltis-btn ${homeSelP}" ${disabledP} onclick="setPalpitePenalti(${m.id}, 'home', this)" aria-label="Palpite prorrogação/pênaltis ${sanitize(m.home)}">${sanitize(m.home.split(' ').pop())}</button>
                    <button class="penaltis-btn ${awaySelP}" ${disabledP} onclick="setPalpitePenalti(${m.id}, 'away', this)" aria-label="Palpite prorrogação/pênaltis ${sanitize(m.away)}">${sanitize(m.away.split(' ').pop())}</button>
                </div>`;
            }

            html += `
            <div class="match">
                <div class="match-info">
                    <span class="match-home">${sanitize(m.home)}</span>
                    <div class="match-score">
                        <input type="number" min="0" max="99" id="ph_${m.id}" value="${pH}" placeholder="-" ${lockAttr} aria-label="Palpite gols ${sanitize(m.home)}">
                        <span class="x" aria-hidden="true">✕</span>
                        <input type="number" min="0" max="99" id="pa_${m.id}" value="${pA}" placeholder="-" ${lockAttr} aria-label="Palpite gols ${sanitize(m.away)}">
                    </div>
                    <span class="match-away">${sanitize(m.away)}</span>
                </div>
                <span class="match-date">${lockIcon}${timeLabel} ${getMatchLabel(m)}</span>
                ${penPalpiteHtml}
            </div>`;
        });
        html += '</div></div>';
    });

    const pct = totalJogos > 0 ? Math.round((totalPreenchidos / totalJogos) * 100) : 0;
    const progressHtml = `<div style="margin-bottom:12px; font-size:0.82em; color:var(--cor-texto-suave);">
        Progresso: ${totalPreenchidos}/${totalJogos} palpites (${pct}%)
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    </div>`;

    container.innerHTML = progressHtml + html;
}

// Verifica se um jogo está bloqueado (10 min antes do horário)
function isMatchLocked(m) {
    if (!m.date || !m.time) return false;
    const [dia, mes] = m.date.split('/').map(Number);
    const [hora, min] = m.time.split(':').map(Number);
    const matchDate = new Date(2026, mes - 1, dia, hora, min);
    const lockTime = new Date(matchDate.getTime() - 10 * 60 * 1000);
    return new Date() >= lockTime;
}

function savePalpites() {
    if (!loggedUser) { toast('Faça login!', 'warning'); return; }

    const data = {};
    const palpitesAntigos = palpites[loggedUser] || {};
    let count = 0;

    allMatches.forEach(m => {
        const hEl = $(`ph_${m.id}`);
        const aEl = $(`pa_${m.id}`);

        if (hEl && aEl && hEl.value !== '' && aEl.value !== '') {
            if (!loggedAsAdmin && isMatchLocked(m)) {
                if (palpitesAntigos[m.id]) { data[m.id] = palpitesAntigos[m.id]; count++; }
            } else {
                if (!validateScore(hEl.value) || !validateScore(aEl.value)) return;
                const palpiteData = { home: parseInt(hEl.value), away: parseInt(aEl.value) };
                const penVal = palpitePenaltis[m.id] || palpitePenaltis[String(m.id)];
                if (!m.group && penVal) palpiteData.penalti = penVal;
                data[m.id] = palpiteData;
                count++;
            }
        } else if (palpitesAntigos[m.id] && !loggedAsAdmin && isMatchLocked(m)) {
            data[m.id] = palpitesAntigos[m.id];
            count++;
        }
    });

    firebase.database().ref('palpites/' + loggedUser).set(data).then(() => {
        toast(`Palpites salvos! (${count} jogos)`);
        renderPalpites(loggedUser);
    }).catch(err => {
        toast('Erro ao salvar: ' + err.message, 'error');
    });
}

// ===== ALTERAR SENHA =====
function showChangePassword() {
    if (!loggedUser) { toast('Faça login primeiro!', 'warning'); return; }
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'modal-change-pass';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
    <div class="modal">
        <h3>🔑 Alterar Senha</h3>
        <label style="color:var(--cor-texto-suave); font-size:0.82em; display:block; margin-bottom:4px;">Nova senha:</label>
        <input type="password" id="new-pass-1" placeholder="Digite a nova senha..." aria-label="Nova senha">
        <label style="color:var(--cor-texto-suave); font-size:0.82em; display:block; margin-bottom:4px;">Confirme:</label>
        <input type="password" id="new-pass-2" placeholder="Confirme a nova senha..." aria-label="Confirmar nova senha" onkeypress="if(event.key==='Enter')saveNewPassword()">
        <div class="modal-btns">
            <button class="btn-gray" onclick="document.getElementById('modal-change-pass').remove()">Cancelar</button>
            <button class="btn-green" onclick="saveNewPassword()">Salvar</button>
        </div>
    </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => $('new-pass-1').focus(), 100);
}

function saveNewPassword() {
    const p1 = $('new-pass-1').value.trim();
    const p2 = $('new-pass-2').value.trim();
    if (!p1) { toast('Digite a nova senha!', 'warning'); return; }
    if (p1.length < 3) { toast('Senha muito curta (mín 3 caracteres)!', 'warning'); return; }
    if (p1 !== p2) { toast('As senhas não coincidem!', 'error'); return; }
    hashPassword(p1).then(hashed => {
        firebase.database().ref('apostadores/' + loggedUser).set(hashed).then(() => {
            $('modal-change-pass').remove();
            toast('Senha alterada com sucesso!');
        });
    });
}

// Calcula pontuação total, detalhamento e o histórico jogo-a-jogo de um apostador.
// Reutilizado tanto pelo ranking (agregado) quanto pelo modal de resumo individual.
function calcularDetalhesApostador(nome) {
    let totalPts = 0;
    const det = { exatos: 0, vencedor: 0, parcial: 0, penaltis: 0 };
    const jogos = [];
    const pp = palpites[nome] || {};

    allMatches.forEach(m => {
        const r = results[m.id] || results[String(m.id)];
        const p = pp[m.id] || pp[String(m.id)];
        if (!r || !p) return;
        const rH = Number(r.home), rA = Number(r.away);
        const pH = Number(p.home), pA = Number(p.away);
        if (isNaN(rH) || isNaN(rA) || isNaN(pH) || isNaN(pA)) return;

        let matchPts = 0;
        let tag = '✗ Errou';
        if (pH === rH && pA === rA) {
            matchPts += 20;
            det.exatos++;
            tag = '🎯 Na Mosca';
        } else {
            const acertouVencedor = (rH > rA && pH > pA) || (rH < rA && pH < pA) || (rH === rA && pH === pA);
            const acertouParcial = (pH === rH || pA === rA);
            if (acertouVencedor) { matchPts += 10; det.vencedor++; }
            if (acertouParcial) { matchPts += 5; det.parcial++; }
            if (acertouVencedor && acertouParcial) tag = '✓ Antenado + ½ Melhor que Nada';
            else if (acertouVencedor) tag = '✓ Antenado';
            else if (acertouParcial) tag = '½ Melhor que Nada';
        }

        let penBonus = false;
        if (!m.group && rH === rA) {
            const penReal = penaltis[m.id] || penaltis[String(m.id)];
            const penPalpite = p.penalti;
            if (penReal && penPalpite && penReal === penPalpite) {
                matchPts += 10;
                det.penaltis++;
                penBonus = true;
            }
        }

        totalPts += matchPts;
        jogos.push({ m, rH, rA, pH, pA, pts: matchPts, tag, penBonus });
    });

    return { totalPts, det, jogos };
}

// ===== RANKING =====
function calcularRanking() {
    const container = $('ranking-container');
    if (!container) return;

    const filtroGrupo = $('ranking-filtro-grupo');
    const grupoSelecionado = filtroGrupo ? filtroGrupo.value : '';

    let nomes = Object.keys(apostadores);
    if (grupoSelecionado) {
        nomes = nomes.filter(n => apostadorGrupos[n] === grupoSelecionado);
    }

    if (nomes.length === 0) {
        container.innerHTML = '<p style="color:var(--cor-texto-suave);">Nenhum apostador neste grupo.</p>';
        return;
    }

    const ranking = nomes.map(nome => {
        const { totalPts, det } = calcularDetalhesApostador(nome);
        return { nome, totalPts, det };
    });

    ranking.sort((a, b) => {
        if (b.totalPts !== a.totalPts) return b.totalPts - a.totalPts;
        if (b.det.exatos !== a.det.exatos) return b.det.exatos - a.det.exatos;
        if (b.det.vencedor !== a.det.vencedor) return b.det.vencedor - a.det.vencedor;
        if (b.det.penaltis !== a.det.penaltis) return b.det.penaltis - a.det.penaltis;
        return b.det.parcial - a.det.parcial;
    });

    if (ranking.length === 0 || ranking.every(r => r.totalPts === 0 && r.det.exatos === 0)) {
        container.innerHTML = '<p style="color:var(--cor-texto-suave);">Sem dados ainda. Os pontos aparecerão após resultados serem registrados.</p>';
        return;
    }

    let html = '';
    ranking.forEach((r, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`;
        html += `
        <div class="ranking-item" role="listitem" tabindex="0" onclick="showApostadorResumo('${sanitize(r.nome)}')" onkeypress="if(event.key==='Enter')showApostadorResumo('${sanitize(r.nome)}')" aria-label="Ver resumo de ${sanitize(r.nome)}">
            <span class="ranking-pos">${medal}</span>
            <span class="ranking-name">${sanitize(r.nome)}</span>
            <span class="ranking-details">${r.det.exatos}🎯 ${r.det.vencedor}✓ ${r.det.parcial}½ ${r.det.penaltis}⚡</span>
            <span class="ranking-pts">${r.totalPts} pts</span>
        </div>`;
    });
    container.innerHTML = html;
}

// ===== RESUMO DO APOSTADOR (modal ao clicar no card do ranking) =====
function showApostadorResumo(nome) {
    if (!apostadores[nome]) return;
    const { totalPts, det, jogos } = calcularDetalhesApostador(nome);
    const grupo = apostadorGrupos[nome] ? `<span style="font-size:0.75em; color:var(--cor-texto-muted);">👥 ${sanitize(apostadorGrupos[nome])}</span>` : '';

    let jogosHtml = '';
    if (jogos.length === 0) {
        jogosHtml = '<p style="color:var(--cor-texto-suave); font-size:0.85em; text-align:center; padding:12px 0;">Nenhum jogo com palpite e resultado registrados ainda.</p>';
    } else {
        // Mostra os jogos mais recentes primeiro
        jogosHtml = jogos.slice().reverse().map(j => {
            const penInfo = j.penBonus ? ' <span style="color:var(--cor-dourado);">+10⚡</span>' : '';
            const ptsColor = j.pts >= 20 ? 'var(--cor-dourado)' : j.pts > 0 ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)';
            return `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.82em;">
                <div style="flex:1; min-width:0;">
                    <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${sanitize(j.m.home)} <strong>${j.rH}x${j.rA}</strong> ${sanitize(j.m.away)}</div>
                    <div style="color:var(--cor-texto-muted); font-size:0.9em;">Palpite: ${j.pH}x${j.pA} — ${j.tag}${penInfo}</div>
                </div>
                <div style="font-weight:700; color:${ptsColor}; white-space:nowrap;">${j.pts} pts</div>
            </div>`;
        }).join('');
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'modal-resumo-apostador';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-resumo-title');
    overlay.innerHTML = `
    <div class="modal" style="max-width:480px;">
        <h3 id="modal-resumo-title">📋 Resumo de ${sanitize(nome)}</h3>
        ${grupo}
        <div style="display:flex; gap:10px; margin:14px 0; flex-wrap:wrap;">
            <div style="flex:1; min-width:90px; text-align:center; background:rgba(255,213,74,0.1); border-radius:var(--radius-sm); padding:10px;">
                <div style="font-size:1.4em; font-weight:800; color:var(--cor-dourado);">${totalPts}</div>
                <div style="font-size:0.72em; color:var(--cor-texto-muted);">pontos</div>
            </div>
            <div style="flex:1; min-width:90px; text-align:center; background:rgba(255,255,255,0.05); border-radius:var(--radius-sm); padding:10px;">
                <div style="font-size:1.1em; font-weight:700;">${det.exatos}🎯 ${det.vencedor}✓</div>
                <div style="font-size:0.72em; color:var(--cor-texto-muted);">${det.parcial}½ acertos • ${det.penaltis}⚡ prorrogação/pênaltis</div>
            </div>
        </div>
        <h4 style="color:var(--cor-dourado); font-size:0.9em; margin-bottom:8px;">Últimos jogos</h4>
        <div style="max-height:45vh; overflow-y:auto; margin-bottom:14px;">
            ${jogosHtml}
        </div>
        <button class="btn btn-ghost" style="width:100%;" onclick="document.getElementById('modal-resumo-apostador').remove()">Fechar</button>
    </div>`;
    document.body.appendChild(overlay);
}

// ===== CHAVEAMENTO VISUAL =====
let currentBracketPhase = '32avos';

function showBracketPhase(phase, btn) {
    currentBracketPhase = phase;
    document.querySelectorAll('.bracket-phase-btn').forEach(b => {
        b.classList.remove('active');
        b.classList.add('btn-ghost');
        b.classList.remove('btn-primary');
    });
    btn.classList.add('active');
    btn.classList.remove('btn-ghost');
    btn.classList.add('btn-primary');
    renderBracket();
}

function renderBracket() {
    const container = $('bracket-container');
    if (!container) return;

    if (currentBracketPhase === 'semis-final') {
        renderBracketFinals(container);
    } else if (currentBracketPhase === '32avos') {
        renderBracketPhase(container, '32avos', 'oitavas');
    } else if (currentBracketPhase === 'oitavas') {
        renderBracketPhase(container, 'oitavas', 'quartas');
    } else if (currentBracketPhase === 'quartas') {
        renderBracketPhase(container, 'quartas', 'semi');
    }
}

function renderBracketPhase(container, phase1, phase2) {
    const matches1 = knockoutMatches.filter(m => m.phase === phase1);
    const matches2 = knockoutMatches.filter(m => m.phase === phase2);

    let html = '<div class="bracket-grid" style="grid-template-columns: 1fr auto 1fr;">';
    html += `<div class="bracket-round"><div class="bracket-round-title">${phaseNames[phase1]}</div>`;
    matches1.forEach(m => { html += renderBracketMatch(m); });
    html += '</div>';
    html += '<div class="bracket-connector">→</div>';
    html += `<div class="bracket-round"><div class="bracket-round-title">${phaseNames[phase2]}</div>`;
    matches2.forEach(m => { html += renderBracketMatch(m); });
    html += '</div>';
    html += '</div>';
    container.innerHTML = html;
}

function renderBracketFinals(container) {
    const semis = knockoutMatches.filter(m => m.phase === 'semi');
    const terceiro = knockoutMatches.filter(m => m.phase === 'terceiro');
    const final = knockoutMatches.filter(m => m.phase === 'final');

    let html = '<div class="bracket-finals">';
    html += `<div class="bracket-finals-col">
        <div class="bracket-round-title">${phaseNames['semi']}</div>`;
    semis.forEach(m => { html += renderBracketMatch(m); });
    html += '</div>';

    html += `<div class="bracket-finals-col" style="align-items:center;">
        <div class="bracket-trophy" aria-hidden="true">🏆</div>
        <div class="bracket-round-title">${phaseNames['final']}</div>`;
    final.forEach(m => { html += renderBracketMatch(m); });
    html += `<div style="margin-top:16px;"><div class="bracket-round-title">${phaseNames['terceiro']}</div>`;
    terceiro.forEach(m => { html += renderBracketMatch(m); });
    html += '</div></div>';

    html += '<div class="bracket-finals-col" style="align-items:center;">';
    html += renderChampionBox();
    html += '</div>';
    html += '</div>';
    container.innerHTML = html;
}

function renderBracketMatch(m) {
    const r = results[m.id] || results[String(m.id)];
    const hasResult = r && r.home !== '' && r.away !== '';
    const homeGoals = hasResult ? Number(r.home) : null;
    const awayGoals = hasResult ? Number(r.away) : null;

    let homeWin = false, awayWin = false, isPenaltis = false;
    if (hasResult) {
        if (homeGoals > awayGoals) {
            homeWin = true;
        } else if (awayGoals > homeGoals) {
            awayWin = true;
        } else {
            const pen = penaltis[m.id] || penaltis[String(m.id)];
            if (pen === 'home') { homeWin = true; isPenaltis = true; }
            else if (pen === 'away') { awayWin = true; isPenaltis = true; }
        }
    }

    const homeClass = hasResult ? (homeWin ? 'winner' : (awayWin ? 'loser' : '')) : '';
    const awayClass = hasResult ? (awayWin ? 'winner' : (homeWin ? 'loser' : '')) : '';
    const matchClass = hasResult ? 'has-result' : '';
    const penLabel = isPenaltis ? ' <span style="font-size:0.8em; color:var(--cor-erro);">(pen)</span>' : '';

    const kt = knockoutTeams[m.id] || knockoutTeams[String(m.id)];
    const homeTeam = sanitize((kt && kt.home) || m.home);
    const awayTeam = sanitize((kt && kt.away) || m.away);

    return `
    <div class="bracket-match ${matchClass}">
        <div class="bracket-team ${homeClass}">
            <span class="bracket-team-name">${homeTeam}</span>
            <span class="bracket-team-score">${hasResult ? homeGoals : '-'}${homeWin && isPenaltis ? ' ⚡' : ''}</span>
        </div>
        <div class="bracket-team ${awayClass}">
            <span class="bracket-team-name">${awayTeam}</span>
            <span class="bracket-team-score">${hasResult ? awayGoals : '-'}${awayWin && isPenaltis ? ' ⚡' : ''}</span>
        </div>
        <div class="bracket-match-info">J${m.id} • ${getDateLabel(m.date)} ${m.time || ''}${penLabel}</div>
    </div>`;
}

function renderChampionBox() {
    const finalMatch = knockoutMatches.find(m => m.phase === 'final');
    const r = results[finalMatch.id] || results[String(finalMatch.id)];
    if (!r || r.home === '' || r.away === '') {
        return `<div style="text-align:center; padding:20px; color:var(--cor-texto-muted); font-size:0.9em;">
            <div style="font-size:2em; margin-bottom:8px;">👑</div>
            Campeão a definir
        </div>`;
    }
    const { winner } = getWinnerAndLoser(finalMatch.id, results);
    return `<div style="text-align:center; padding:20px; background:linear-gradient(135deg, rgba(247,217,23,0.2), rgba(247,217,23,0.05)); border-radius:var(--radius); border:2px solid var(--cor-dourado);">
        <div style="font-size:2em; margin-bottom:8px;">👑🏆</div>
        <div style="font-size:1.2em; font-weight:bold; color:var(--cor-dourado);">CAMPEÃO</div>
        <div style="font-size:1.1em; margin-top:6px;">${winner || '?'}</div>
    </div>`;
}

// ===== EDITAR TIMES MATA-MATA =====
function editKnockoutTeams() {
    const phases = [...new Set(knockoutMatches.map(m => m.phase))];
    let html = '<div style="max-height:70vh; overflow-y:auto; padding:10px;">';
    html += '<p style="color:var(--cor-texto-suave); margin-bottom:15px; font-size:0.85em;">Preencha os nomes dos times conforme avançam:</p>';
    phases.forEach(phase => {
        const pm = knockoutMatches.filter(m => m.phase === phase);
        html += `<h4 style="color:var(--cor-dourado); margin:12px 0 8px;">${phaseNames[phase]}</h4>`;
        pm.forEach(m => {
            const saved = knockoutTeams[m.id] || {};
            html += `<div style="display:flex; gap:6px; margin-bottom:6px; align-items:center; flex-wrap:wrap;">
                <span style="font-size:0.75em; color:#888; min-width:30px;">J${m.id}</span>
                <input type="text" id="kt_h_${m.id}" value="${sanitize(saved.home || '')}" maxlength="30" placeholder="Time casa..." aria-label="Time da casa jogo ${m.id}" style="flex:1; min-width:100px; padding:6px; border:1px solid #555; border-radius:5px; background:#1e272e; color:#fff; font-size:0.85em;">
                <span style="color:var(--cor-dourado);">✕</span>
                <input type="text" id="kt_a_${m.id}" value="${sanitize(saved.away || '')}" maxlength="30" placeholder="Time fora..." aria-label="Time visitante jogo ${m.id}" style="flex:1; min-width:100px; padding:6px; border:1px solid #555; border-radius:5px; background:#1e272e; color:#fff; font-size:0.85em;">
            </div>`;
        });
    });
    html += '</div><div class="actions" style="margin-top:15px;"><button class="btn btn-primary" onclick="saveKnockoutTeams()">💾 Salvar Times</button></div>';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'modal-knockout';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `<div class="modal" style="max-width:600px;"><h3>✏️ Definir Times do Mata-Mata</h3>${html}<button class="btn btn-ghost" style="margin-top:10px; width:100%;" onclick="document.getElementById('modal-knockout').remove()">Fechar</button></div>`;
    document.body.appendChild(overlay);
}

function saveKnockoutTeams() {
    const data = {};
    knockoutMatches.forEach(m => {
        const h = $(`kt_h_${m.id}`);
        const a = $(`kt_a_${m.id}`);
        if (h && a) {
            const hv = h.value.trim().slice(0, 30);
            const av = a.value.trim().slice(0, 30);
            if (hv || av) data[m.id] = { home: hv || 'A definir', away: av || 'A definir' };
        }
    });
    firebase.database().ref('knockoutTeams').set(data).then(() => {
        toast('Times do mata-mata salvos!');
        const modal = $('modal-knockout');
        if (modal) modal.remove();
    }).catch(err => {
        toast('Erro ao salvar: ' + err.message, 'error');
    });
}
