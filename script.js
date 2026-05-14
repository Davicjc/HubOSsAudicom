// ── Storage keys ────────────────────────────
const KEY_TECNICOS  = 'audicom_os_tecnicos';
const KEY_HISTORICO = 'audicom_os_historico';

// ── Estado ───────────────────────────────────
let tecnicos   = JSON.parse(localStorage.getItem(KEY_TECNICOS)   || '[]');
let historico  = JSON.parse(localStorage.getItem(KEY_HISTORICO)  || '[]');
let tecnicoAtivo = null;
let osPendente   = null;

// ── Filtro ativo na tela OSs abertas ─────────
let _filtroAtivo = 'todas';

// ── Paleta de cores para avatares ────────────
const CORES = [
    ['#8b5cf6','rgba(139,92,246,0.2)'],
    ['#3b82f6','rgba(59,130,246,0.2)'],
    ['#10b981','rgba(16,185,129,0.2)'],
    ['#f59e0b','rgba(245,158,11,0.2)'],
    ['#ef4444','rgba(239,68,68,0.2)'],
    ['#06b6d4','rgba(6,182,212,0.2)'],
    ['#ec4899','rgba(236,72,153,0.2)'],
];
function corPara(id) {
    const i = String(id).charCodeAt(0) % CORES.length;
    return CORES[i] || CORES[0];
}
function iniciais(nome) {
    return nome.trim().split(/\s+/).slice(0,2).map(p => p[0].toUpperCase()).join('');
}

// ════════════════════════════════════════════
//  TELA DE TÉCNICOS
// ════════════════════════════════════════════

function renderTecnicos() {
    const grid = document.getElementById('tecnicos-grid');
    if (tecnicos.length === 0) {
        grid.innerHTML = `
            <div class="tecnicos-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>Nenhum técnico cadastrado</p>
                <small>Clique em "Novo Técnico" para começar</small>
            </div>`;
        return;
    }

    grid.innerHTML = tecnicos.map(tec => {
        const [cor, bg] = corPara(tec.id);
        const ini = iniciais(tec.nome);
        return `
        <div class="tecnico-card" onclick="abrirCalendario(${tec.id})" style="cursor:pointer">
            <div class="tecnico-card-top">
                <div class="avatar" style="background:${bg};color:${cor};border:1px solid ${cor}40">${ini}</div>
                <div class="tecnico-card-info">
                    <div class="tecnico-card-nome">${tec.nome}</div>
                    <div class="tecnico-card-funcao">${tec.funcao}</div>
                    ${tec.telefone ? `<div class="tecnico-card-fone">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.41 2 2 0 0 1 3.57 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        ${tec.telefone}
                    </div>` : ''}
                </div>
            </div>
            <div class="tecnico-card-actions" onclick="event.stopPropagation()">
                <div class="tecnico-card-edit-del">
                    <button class="os-action-btn" title="Editar" onclick="editarTecnico(${tec.id})">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="os-action-btn danger" title="Excluir" onclick="excluirTecnico(${tec.id})">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </button>
                </div>
                <button class="btn-enter" onclick="entrarComoTecnico(${tec.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Entrar
                </button>
            </div>
        </div>`;
    }).join('');
}

let _tecPendente = null;

function entrarComoTecnico(id) {
    const tec = tecnicos.find(t => t.id === id);
    if (!tec) return;
    _tecPendente = tec;

    const [cor, bg] = corPara(tec.id);
    const ini = iniciais(tec.nome);

    document.getElementById('senha-confirm-info').innerHTML = `
        <div class="avatar-mini" style="background:${bg};color:${cor};border:1px solid ${cor}60;width:40px;height:40px;font-size:14px;flex-shrink:0">${ini}</div>
        <div>
            <div class="senha-confirm-nome">${tec.nome}</div>
            <div class="senha-confirm-funcao">${tec.funcao}</div>
        </div>`;

    document.getElementById('input-senha-confirm').value = '';
    document.getElementById('senha-erro').style.display = 'none';
    document.getElementById('modal-senha').classList.add('show');
    setTimeout(() => document.getElementById('input-senha-confirm').focus(), 120);
}

function fecharModalSenha() {
    document.getElementById('modal-senha').classList.remove('show');
    _tecPendente = null;
}

function fecharModalSenhaOverlay(e) {
    if (e.target.id === 'modal-senha') fecharModalSenha();
}

function confirmarSenhaEntrar() {
    if (!_tecPendente) return;
    const digitada = document.getElementById('input-senha-confirm').value;
    if (digitada !== _tecPendente.senha) {
        document.getElementById('senha-erro').style.display = 'block';
        document.getElementById('input-senha-confirm').focus();
        return;
    }
    document.getElementById('senha-erro').style.display = 'none';
    fecharModalSenha();

    const tec = _tecPendente;
    tecnicoAtivo = tec;
    _tecPendente = null;

    const [cor, bg] = corPara(tec.id);
    const ini = iniciais(tec.nome);

    const avatarBar = document.getElementById('tecnico-avatar-bar');
    avatarBar.textContent = ini;
    avatarBar.style.background = bg;
    avatarBar.style.color = cor;
    avatarBar.style.border = `1px solid ${cor}60`;

    document.getElementById('tecnico-nome-bar').textContent = tec.nome;
    document.getElementById('tecnico-funcao-bar').textContent = tec.funcao;
    document.getElementById('bar-back-label').textContent = 'Técnicos';
    _origemOS = 'tecnicos';

    mostrarTela('tela-os');
    renderHistorico();
}

function toggleSenha(inputId, btn) {
    const input = document.getElementById(inputId);
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    btn.style.color = mostrar ? 'var(--blue)' : 'var(--text3)';
}

// ── CRUD Técnicos ────────────────────────────

function abrirModalNovoTecnico() {
    document.getElementById('modal-tecnico-titulo').textContent = 'Novo Técnico';
    document.getElementById('tecnico-edit-id').value = '';
    document.getElementById('tec-nome').value = '';
    document.getElementById('tec-telefone').value = '';
    document.getElementById('tec-funcao').value = 'Técnico de Campo';
    document.getElementById('tec-senha').value = '';
    document.getElementById('modal-tecnico').classList.add('show');
    setTimeout(() => document.getElementById('tec-nome').focus(), 100);
}

function editarTecnico(id) {
    const tec = tecnicos.find(t => t.id === id);
    if (!tec) return;
    document.getElementById('modal-tecnico-titulo').textContent = 'Editar Técnico';
    document.getElementById('tecnico-edit-id').value = tec.id;
    document.getElementById('tec-nome').value = tec.nome;
    document.getElementById('tec-telefone').value = tec.telefone || '';
    document.getElementById('tec-funcao').value = tec.funcao;
    document.getElementById('tec-senha').value = '';
    document.getElementById('modal-tecnico').classList.add('show');
    setTimeout(() => document.getElementById('tec-nome').focus(), 100);
}

function fecharModalTecnico() {
    document.getElementById('modal-tecnico').classList.remove('show');
}

function fecharModalTecnicoOverlay(e) {
    if (e.target.id === 'modal-tecnico') fecharModalTecnico();
}

function salvarTecnico() {
    const nome   = document.getElementById('tec-nome').value.trim();
    const senha  = document.getElementById('tec-senha').value;
    const editId = document.getElementById('tecnico-edit-id').value;

    if (!nome) {
        showToast('Informe o nome do técnico.', 'error');
        document.getElementById('tec-nome').focus();
        return;
    }
    if (!editId && !senha) {
        showToast('Crie uma senha para o técnico.', 'error');
        document.getElementById('tec-senha').focus();
        return;
    }

    const telefone = document.getElementById('tec-telefone').value.trim();
    const funcao   = document.getElementById('tec-funcao').value;

    if (editId) {
        const idx = tecnicos.findIndex(t => t.id == editId);
        if (idx >= 0) {
            tecnicos[idx] = {
                ...tecnicos[idx],
                nome, telefone, funcao,
                ...(senha ? { senha } : {}),
            };
            showToast('Técnico atualizado!', 'success');
        }
    } else {
        tecnicos.push({ id: Date.now(), nome, telefone, funcao, senha });
        showToast('Técnico cadastrado!', 'success');
    }

    localStorage.setItem(KEY_TECNICOS, JSON.stringify(tecnicos));
    fecharModalTecnico();
    renderTecnicos();
}

function excluirTecnico(id) {
    if (!confirm('Excluir este técnico?')) return;
    tecnicos = tecnicos.filter(t => t.id !== id);
    localStorage.setItem(KEY_TECNICOS, JSON.stringify(tecnicos));
    renderTecnicos();
    showToast('Técnico removido.', 'info');
}

// ════════════════════════════════════════════
//  FORMULÁRIO DE OS
// ════════════════════════════════════════════

function mascaraTelefone(el) {
    let v = el.value.replace(/\D/g, '');
    if (v.length <= 10) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    el.value = v;
}

function coletarDados() {
    return {
        codigoHubsoft:    document.getElementById('codigoHubsoft').value.trim(),
        clienteHubsoft:   document.getElementById('clienteHubsoft').value.trim(),
        pontoHubsoft:     document.getElementById('pontoHubsoft').value.trim(),
        falha:            document.getElementById('falha').value.trim(),
        telefone:         document.getElementById('telefone').value.trim(),
        disponibilidade:  document.getElementById('disponibilidade').value.trim(),
        responsavel:      document.getElementById('responsavel').value.trim(),
        local:            document.getElementById('local').value.trim(),
        protocoloHubsoft: document.getElementById('protocoloHubsoft').value.trim(),
        protocoloJames:   document.getElementById('protocoloJames').value.trim(),
    };
}

function validar(dados) {
    if (!dados.clienteHubsoft) {
        showToast('Preencha ao menos o Cliente HubSoft.', 'error');
        document.getElementById('clienteHubsoft').focus();
        return false;
    }
    return true;
}

function gerarResumo(dados) {
    return (
        `▪️ Código HubSoft: ${dados.codigoHubsoft || '—'}\n` +
        `▪️ Cliente HubSoft: ${dados.clienteHubsoft || '—'}\n` +
        `▪️ Ponto HubSoft: ${dados.pontoHubsoft || '—'}\n` +
        `▪️ Falha: ${dados.falha || '—'}\n` +
        `▪️ Telefone: ${dados.telefone || '—'}\n` +
        `▪️ Disponibilidade: ${dados.disponibilidade || '—'}\n` +
        `▪️ Responsável pelo local: ${dados.responsavel || '—'}\n` +
        `▪️ Local: ${dados.local || '—'}\n` +
        `▪️ Protocolo HubSoft: ${dados.protocoloHubsoft || '—'}\n` +
        `▪️ Protocolo James: ${dados.protocoloJames || '—'}`
    );
}

function abrirModal() {
    const dados = coletarDados();
    if (!validar(dados)) return;
    osPendente = dados;
    document.getElementById('modal-conteudo').textContent = gerarResumo(dados);
    document.getElementById('modal').classList.add('show');
}

function fecharModal() {
    document.getElementById('modal').classList.remove('show');
    osPendente = null;
}

function fecharModalOverlay(e) {
    if (e.target.id === 'modal') fecharModal();
}

function copiarResumo() {
    const texto = document.getElementById('modal-conteudo').textContent;
    navigator.clipboard.writeText(texto)
        .then(() => showToast('Copiado!', 'success'))
        .catch(() => {
            const ta = document.createElement('textarea');
            ta.value = texto;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('Copiado!', 'success');
        });
}

function confirmarSalvar() {
    if (!osPendente) return;
    const os = {
        id: Date.now(),
        dados: osPendente,
        tecnico: tecnicoAtivo ? tecnicoAtivo.nome : null,
        tecnicoId: tecnicoAtivo ? tecnicoAtivo.id : null,
        timestamp: new Date().toLocaleString('pt-BR'),
        status: 'aberta',      // 'aberta' | 'atribuida' | 'fechada'
        tratativa: null,       // { data, hora }
    };
    historico.unshift(os);
    localStorage.setItem(KEY_HISTORICO, JSON.stringify(historico));
    atualizarBadge();
    renderHistorico();
    fecharModal();
    limparFormulario(false);
    showToast('OS registrada!', 'success');
}

function limparFormulario(toast = true) {
    ['codigoHubsoft','clienteHubsoft','pontoHubsoft','falha',
     'telefone','disponibilidade','responsavel','local',
     'protocoloHubsoft','protocoloJames'].forEach(id => {
        document.getElementById(id).value = '';
    });
    if (toast) showToast('Formulário limpo.', 'info');
}

// ── Histórico ────────────────────────────────

function removerOS(id) {
    historico = historico.filter(os => os.id !== id);
    sessionStorage.setItem(KEY_HISTORICO, JSON.stringify(historico));
    renderHistorico();
}

function copiarOS(id) {
    const os = historico.find(o => o.id === id);
    if (!os) return;
    navigator.clipboard.writeText(gerarResumo(os.dados))
        .then(() => showToast('OS copiada!', 'success'))
        .catch(() => showToast('Erro ao copiar.', 'error'));
}

function limparHistorico() {
    if (historico.length === 0) return;
    historico = [];
    localStorage.removeItem(KEY_HISTORICO);
    atualizarBadge();
    renderHistorico();
    showToast('Histórico limpo.', 'info');
}

function renderHistorico() {
    const lista = document.getElementById('historico-lista');
    if (!lista) return;
    if (historico.length === 0) {
        lista.innerHTML = `
            <div class="historico-vazio">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>Nenhuma OS registrada ainda</p>
            </div>`;
        return;
    }

    lista.innerHTML = historico.map(os => {
        const d = os.dados;
        const tags = [
            d.codigoHubsoft    && `Cód: ${d.codigoHubsoft}`,
            d.pontoHubsoft     && `Ponto: ${d.pontoHubsoft}`,
            d.telefone         && d.telefone,
            d.protocoloHubsoft && `HS: ${d.protocoloHubsoft}`,
            d.protocoloJames   && `James: ${d.protocoloJames}`,
            os.tecnico         && `Téc: ${os.tecnico}`,
        ].filter(Boolean);

        return `
        <div class="os-card">
            <div class="os-card-icon">📋</div>
            <div class="os-card-body">
                <div class="os-card-title">${d.clienteHubsoft || 'Cliente não informado'}</div>
                <div class="os-card-meta">
                    ${tags.map(t => `<span class="os-meta-tag">${t}</span>`).join('')}
                </div>
                ${d.falha ? `<div class="os-timestamp">${truncar(d.falha, 80)}</div>` : ''}
                <div class="os-timestamp">${os.timestamp}</div>
            </div>
            <div class="os-card-actions">
                <button class="os-action-btn" title="Copiar" onclick="copiarOS(${os.id})">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
                <button class="os-action-btn danger" title="Remover" onclick="removerOS(${os.id})">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                </button>
            </div>
        </div>`;
    }).join('');
}

// ── Toast ─────────────────────────────────────
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast show ${type}`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

function truncar(str, n) {
    return str.length > n ? str.slice(0, n) + '…' : str;
}

// ── Enter para salvar técnico ────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        fecharModal();
        fecharModalTecnico();
        fecharModalSenha();
        fecharModalCalendario();
    }
    if (e.key === 'Enter') {
        if (document.getElementById('modal-tecnico').classList.contains('show')) salvarTecnico();
    }
});

// ════════════════════════════════════════════
//  CALENDÁRIO
// ════════════════════════════════════════════

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

let _calTec   = null;
let _calAno   = 0;
let _calMes   = 0;
let _calSel   = null; // { ano, mes, dia }

function abrirCalendario(id) {
    const tec = tecnicos.find(t => t.id === id);
    if (!tec) return;
    _calTec = tec;

    const hoje = new Date();
    _calAno = hoje.getFullYear();
    _calMes = hoje.getMonth();
    _calSel = { ano: hoje.getFullYear(), mes: hoje.getMonth(), dia: hoje.getDate() };

    const [cor, bg] = corPara(tec.id);
    const ini = iniciais(tec.nome);
    document.getElementById('cal-header-tecnico').innerHTML = `
        <div class="avatar-mini" style="background:${bg};color:${cor};border:1px solid ${cor}60;width:40px;height:40px;font-size:14px;flex-shrink:0">${ini}</div>
        <div>
            <div class="cal-header-nome">${tec.nome}</div>
            <div class="cal-header-funcao">${tec.funcao}</div>
        </div>`;

    renderCalendario();
    document.getElementById('modal-calendario').classList.add('show');
}

function fecharModalCalendario() {
    document.getElementById('modal-calendario').classList.remove('show');
    _calTec = null;
    _calSel = null;
}

function fecharModalCalendarioOverlay(e) {
    if (e.target.id === 'modal-calendario') fecharModalCalendario();
}

function calMudarMes(delta) {
    _calMes += delta;
    if (_calMes > 11) { _calMes = 0;  _calAno++; }
    if (_calMes < 0)  { _calMes = 11; _calAno--; }
    renderCalendario();
}

function renderCalendario() {
    const hoje = new Date();
    const hojeDia = hoje.getDate();
    const hojeMes = hoje.getMonth();
    const hojeAno = hoje.getFullYear();

    document.getElementById('cal-mes-titulo').textContent =
        `${MESES[_calMes]} ${_calAno}`;

    // OSs deste técnico com tratativa neste mês
    const osTec = historico.filter(o =>
        (o.tecnicosIds ? o.tecnicosIds.includes(_calTec.id) : o.tecnicoId === _calTec.id) &&
        o.tratativa && o.tratativa.data
    );
    const diasComOS = new Set(osTec
        .map(o => _parseTratativaData(o.tratativa.data))
        .filter(dt => dt && dt.mes === _calMes && dt.ano === _calAno)
        .map(dt => dt.dia)
    );

    const primeiroDia  = new Date(_calAno, _calMes, 1).getDay();
    const totalDias    = new Date(_calAno, _calMes + 1, 0).getDate();
    const totalDiasAnt = new Date(_calAno, _calMes, 0).getDate();

    let html = '';

    // Dias do mês anterior (cinza)
    for (let i = primeiroDia - 1; i >= 0; i--) {
        html += `<button class="cal-dia cal-dia--outro-mes" disabled>${totalDiasAnt - i}</button>`;
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDias; d++) {
        const eHoje  = d === hojeDia && _calMes === hojeMes && _calAno === hojeAno;
        const eSel   = _calSel && _calSel.dia === d && _calSel.mes === _calMes && _calSel.ano === _calAno;
        const temOS  = diasComOS.has(d);
        let cls = 'cal-dia';
        if (eHoje)       cls += ' cal-dia--hoje';
        else if (eSel)   cls += ' cal-dia--selecionado';
        if (temOS)       cls += ' cal-dia--tem-os';
        html += `<button class="${cls}" onclick="calSelecionarDia(${d})">${d}${temOS ? '<span class="cal-os-dot"></span>' : ''}</button>`;
    }

    // Dias do próximo mês para completar grid
    const celulasUsadas = primeiroDia + totalDias;
    const resto = celulasUsadas % 7 === 0 ? 0 : 7 - (celulasUsadas % 7);
    for (let d = 1; d <= resto; d++) {
        html += `<button class="cal-dia cal-dia--outro-mes" disabled>${d}</button>`;
    }

    document.getElementById('cal-grid').innerHTML = html;
    renderCalOSs(); // sempre atualizar lista
}

function calSelecionarDia(dia) {
    _calSel = { ano: _calAno, mes: _calMes, dia };
    renderCalendario();
}

function renderCalOSs() {
    const cont = document.getElementById('cal-os-lista');
    if (!cont || !_calTec) return;

    // OSs do técnico
    const osTec = historico.filter(o => o.tecnicosIds ? o.tecnicosIds.includes(_calTec.id) : o.tecnicoId === _calTec.id);

    // Se um dia está selecionado, filtrar ESTRITAMENTE por esse dia
    if (_calSel) {
        const selStr = `${String(_calSel.dia).padStart(2,'0')}/${String(_calSel.mes+1).padStart(2,'0')}/${_calSel.ano}`;
        const lista = osTec.filter(o => o.tratativa && o.tratativa.data === selStr);

        if (lista.length === 0) {
            cont.innerHTML = `<div class="cal-os-empty">Nenhuma OS para ${selStr}</div>`;
            return;
        }

        cont.innerHTML = _renderCalOSItems(lista, `OSs em ${selStr}`);
        return;
    }

    // Sem dia selecionado → mostrar todas do técnico
    if (osTec.length === 0) {
        cont.innerHTML = `<div class="cal-os-empty">Nenhuma OS atribuída a este técnico</div>`;
        return;
    }

    cont.innerHTML = _renderCalOSItems(osTec, 'OSs deste técnico');
}

function _renderCalOSItems(lista, titulo) {
    const sortedLista = [...lista].sort((a, b) => {
        const horaA = (a.tratativa && a.tratativa.hora) || '24:00';
        const horaB = (b.tratativa && b.tratativa.hora) || '24:00';
        return horaA.localeCompare(horaB);
    });

    return `
        <div class="cal-os-titulo">${titulo} <span class="cal-os-count">${sortedLista.length}</span></div>
        ${sortedLista.map(os => {
            const d = os.dados;
            const status = os.status || 'aberta';
            const statusCor   = status === 'fechada' ? 'var(--green)' : status === 'atribuida' ? 'var(--blue)' : 'var(--orange)';
            const statusLabel = status === 'fechada' ? 'Concluída' : status === 'atribuida' ? 'Atribuída' : 'Em aberto';
            const hora = os.tratativa && os.tratativa.hora ? ` · ${os.tratativa.hora}` : '';
            const data = os.tratativa && os.tratativa.data ? `${os.tratativa.data}${hora}` : '';
            return `
            <div class="cal-os-item" id="cal-os-item-${os.id}">
                <div class="cal-os-item-top" onclick="toggleOSDetalhes(${os.id})" style="cursor:pointer">
                    <span class="cal-os-cliente">${d.clienteHubsoft || 'Cliente não informado'}</span>
                    <div style="display:flex; align-items:center; gap:8px">
                        <span class="cal-os-status" style="color:${statusCor}">${statusLabel}</span>
                        <svg class="cal-os-expand-icon" id="cal-os-icon-${os.id}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                
                <!-- Resumo recolhido -->
                <div id="cal-os-resumo-${os.id}">
                    ${d.falha ? `<div class="cal-os-falha">${truncar(d.falha, 70)}</div>` : ''}
                    ${d.local ? `<div class="cal-os-falha">📍 ${truncar(d.local, 50)}</div>` : ''}
                    <div class="cal-os-meta">
                        ${d.codigoHubsoft ? `<span>Cód: ${d.codigoHubsoft}</span>` : ''}
                        ${d.telefone ? `<span>${d.telefone}</span>` : ''}
                        ${data ? `<span>🗓 ${data.trim().replace('· ','')}</span>` : ''}
                    </div>
                </div>

                <!-- Detalhes expandidos -->
                <div id="cal-os-detalhes-${os.id}" class="cal-os-detalhes" style="display:none; margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
                    ${d.falha ? `<div class="cal-os-det-row"><strong>Falha:</strong> ${d.falha}</div>` : ''}
                    ${d.responsavel ? `<div class="cal-os-det-row"><strong>Responsável:</strong> ${d.responsavel}</div>` : ''}
                    ${d.disponibilidade ? `<div class="cal-os-det-row"><strong>Disponibilidade:</strong> ${d.disponibilidade}</div>` : ''}
                    ${d.protocoloHubsoft ? `<div class="cal-os-det-row"><strong>Prot. HubSoft:</strong> ${d.protocoloHubsoft}</div>` : ''}
                    ${d.protocoloJames ? `<div class="cal-os-det-row"><strong>Prot. James:</strong> ${d.protocoloJames}</div>` : ''}
                    ${d.local ? `<div class="cal-os-det-row"><strong>Local:</strong> ${d.local}</div>` : ''}
                    ${data ? `<div class="cal-os-det-row"><strong>Agendamento:</strong> ${data.trim().replace('· ','')}</div>` : ''}
                    
                    <div class="cal-os-actions" style="display:flex; gap:8px; margin-top:16px">
                        ${d.local ? `
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.local)}" target="_blank" class="btn-outline-sm" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; flex:1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Mapa
                        </a>` : ''}
                        
                        ${status !== 'fechada' ? `
                        <button class="btn-fechar-os" onclick="fecharOSDoCalendario(${os.id})" style="padding:6px 12px; font-size:12px; flex:1; justify-content:center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                            Concluir OS
                        </button>` : ''}
                    </div>
                </div>
            </div>`;
        }).join('')}`;
}

function toggleOSDetalhes(id) {
    const det = document.getElementById(`cal-os-detalhes-${id}`);
    const res = document.getElementById(`cal-os-resumo-${id}`);
    const icon = document.getElementById(`cal-os-icon-${id}`);
    if (det.style.display === 'none') {
        det.style.display = 'block';
        res.style.display = 'none';
        icon.style.transform = 'rotate(180deg)';
    } else {
        det.style.display = 'none';
        res.style.display = 'block';
        icon.style.transform = 'rotate(0deg)';
    }
}

function fecharOSDoCalendario(id) {
    if (!confirm('Deseja concluir esta OS agora?')) return;
    const os = historico.find(o => o.id === id);
    if (!os) return;
    os.status = 'fechada';
    localStorage.setItem(KEY_HISTORICO, JSON.stringify(historico));
    atualizarBadge();
    renderOSsAbertas();
    renderCalendario(); // Atualiza a agenda atual
    showToast('OS concluída!', 'success');
}


// ════════════════════════════════════════════
//  NAVEGAÇÃO ENTRE TELAS
// ════════════════════════════════════════════

function mostrarTela(id) {
    ['tela-home','tela-tecnicos','tela-os','tela-os-abertas'].forEach(t => {
        const el = document.getElementById(t);
        if (el) el.style.display = t === id ? (id === 'tela-home' ? 'flex' : 'block') : 'none';
    });
    window.scrollTo(0, 0);
}

function irParaOS() {
    _origemOS = 'home';
    tecnicoAtivo = null;
    document.getElementById('tecnico-avatar-bar').textContent = '';
    document.getElementById('tecnico-avatar-bar').style.cssText = '';
    document.getElementById('tecnico-nome-bar').textContent = 'Sem técnico selecionado';
    document.getElementById('tecnico-funcao-bar').textContent = 'Acesse Técnicos para selecionar';
    document.getElementById('bar-back-label').textContent = 'Início';
    mostrarTela('tela-os');
    renderHistorico();
}

function irParaTecnicos() {
    mostrarTela('tela-tecnicos');
}

function voltarParaTecnicos() {
    tecnicoAtivo = null;
    mostrarTela('tela-tecnicos');
}

let _origemOS = 'home';

function voltarDaOS() {
    tecnicoAtivo = null;
    mostrarTela(_origemOS === 'tecnicos' ? 'tela-tecnicos' : 'tela-home');
}

function irParaOSsAbertas() {
    _filtroAtivo = 'todas';
    document.querySelectorAll('.os-filtro-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filtro === 'todas');
    });
    renderOSsAbertas();
    mostrarTela('tela-os-abertas');
}

// ════════════════════════════════════════════
//  BADGE CONTADOR
// ════════════════════════════════════════════

function atualizarBadge() {
    const abertas = historico.filter(o => o.status === 'aberta' || o.status === 'atribuida').length;
    const badge = document.getElementById('home-badge-os');
    if (badge) {
        badge.textContent = abertas;
        badge.style.display = abertas > 0 ? 'inline-flex' : 'none';
    }
}

// ════════════════════════════════════════════
//  TELA OSs EM ABERTO
// ════════════════════════════════════════════

function filtrarOSs(filtro) {
    _filtroAtivo = filtro;
    document.querySelectorAll('.os-filtro-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filtro === filtro);
    });
    renderOSsAbertas();
}

function renderOSsAbertas() {
    const lista = document.getElementById('os-abertas-lista');

    let itens = historico;
    if (_filtroAtivo === 'abertas')    itens = historico.filter(o => o.status === 'aberta');
    if (_filtroAtivo === 'atribuidas') itens = historico.filter(o => o.status === 'atribuida');
    if (_filtroAtivo === 'fechadas')   itens = historico.filter(o => o.status === 'fechada');

    if (itens.length === 0) {
        lista.innerHTML = `
            <div class="os-vazio">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <line x1="9" y1="12" x2="15" y2="12"/>
                    <line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
                <p>Nenhuma OS encontrada</p>
            </div>`;
        return;
    }

    lista.innerHTML = itens.map(os => {
        const d = os.dados;
        const status = os.status || 'aberta';

        let badgeHTML = '';
        if (status === 'aberta')    badgeHTML = '<span class="os-ab-badge badge-aberta"><svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>Em aberto</span>';
        if (status === 'atribuida') badgeHTML = '<span class="os-ab-badge badge-atribuida"><svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>Atribuída</span>';
        if (status === 'fechada')   badgeHTML = '<span class="os-ab-badge badge-fechada"><svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>Concluída</span>';

        const tags = [
            d.codigoHubsoft    && `Cód: ${d.codigoHubsoft}`,
            d.pontoHubsoft     && `Ponto: ${d.pontoHubsoft}`,
            d.telefone         && d.telefone,
            d.protocoloHubsoft && `HS: ${d.protocoloHubsoft}`,
            d.protocoloJames   && `James: ${d.protocoloJames}`,
        ].filter(Boolean);

        let atribHTML = '';
        if (os.tecnico) {
            const [cor] = corPara(os.tecnicoId || 0);
            const dtTrat = os.tratativa
                ? ` — ${os.tratativa.data}${os.tratativa.hora ? ' às ' + os.tratativa.hora : ''}`
                : '';
            atribHTML = `
                <div class="os-ab-atrib">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <strong style="color:${cor}">${os.tecnico}</strong>${dtTrat}
                </div>`;
        }

        const isFechada = status === 'fechada';
        const btnAtrib = !isFechada
            ? `<button class="btn-atribuir" onclick="abrirModalAtribuir(${os.id})">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    ${os.tecnico ? 'Reatribuir' : 'Atribuir'}
               </button>` : '';

        const btnFechar = !isFechada
            ? `<button class="btn-fechar-os" onclick="fecharOS(${os.id})">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Concluir
               </button>` : '';

        return `
        <div class="os-ab-card">
            <div class="os-ab-top">
                <div>
                    <div class="os-ab-cliente">${d.clienteHubsoft || 'Cliente não informado'}</div>
                    ${d.falha ? `<div class="os-ab-falha">${truncar(d.falha, 90)}</div>` : ''}
                    ${tags.length ? `<div class="os-ab-tags">${tags.map(t => `<span class="os-ab-tag">${t}</span>`).join('')}</div>` : ''}
                    ${atribHTML}
                </div>
                ${badgeHTML}
            </div>
            <div class="os-ab-footer">
                <span class="os-ab-data">${os.timestamp}</span>
                <div class="os-ab-actions">
                    ${btnAtrib}
                    ${btnFechar}
                    <button class="btn-del-os" title="Excluir" onclick="deletarOS(${os.id})">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function fecharOS(id) {
    const os = historico.find(o => o.id === id);
    if (!os) return;
    os.status = 'fechada';
    localStorage.setItem(KEY_HISTORICO, JSON.stringify(historico));
    atualizarBadge();
    renderOSsAbertas();
    showToast('OS concluída!', 'success');
}

function deletarOS(id) {
    if (!confirm('Excluir esta OS definitivamente?')) return;
    historico = historico.filter(o => o.id !== id);
    localStorage.setItem(KEY_HISTORICO, JSON.stringify(historico));
    atualizarBadge();
    renderOSsAbertas();
    renderHistorico();
    showToast('OS excluída.', 'info');
}

// ════════════════════════════════════════════
//  MODAL · ATRIBUIR OS
// ════════════════════════════════════════════

let _atribuirOsId  = null;
let _atribuirTecIds = []; // Modificado para array
let _atribuirData  = null;   // { ano, mes, dia }
let _atribuirHora  = null;
let _atribuirCalAno = 0;
let _atribuirCalMes = 0;

const SLOTS_HORA = ['07:00','07:30','08:00','08:30','09:00','09:30',
                    '10:00','10:30','11:00','11:30','13:00','13:30',
                    '14:00','14:30','15:00','15:30','16:00','16:30',
                    '17:00','17:30','18:00'];

function abrirModalAtribuir(osId) {
    const os = historico.find(o => o.id === osId);
    if (!os) return;

    _atribuirOsId  = osId;
    _atribuirTecIds = os.tecnicosIds ? [...os.tecnicosIds] : (os.tecnicoId ? [os.tecnicoId] : []);
    _atribuirData  = os.tratativa ? _parseTratativaData(os.tratativa.data) : null;
    _atribuirHora  = os.tratativa ? os.tratativa.hora : null;

    const hoje = new Date();
    _atribuirCalAno = hoje.getFullYear();
    _atribuirCalMes = hoje.getMonth();

    // Resumo da OS
    const d = os.dados;
    document.getElementById('atribuir-os-resumo').innerHTML = `
        <div class="atribuir-os-cliente">${d.clienteHubsoft || 'Cliente não informado'}</div>
        ${d.falha ? `<div class="atribuir-os-falha">${truncar(d.falha, 100)}</div>` : ''}
        ${d.local ? `<div class="atribuir-os-falha" style="margin-top:4px">📍 ${d.local}</div>` : ''}`;

    _renderAtribuirTecnicos();
    _renderAtribuirCalendario();
    _renderAtribuirSlots();

    const inp = document.getElementById('atribuir-hora-custom');
    inp.value = _atribuirHora || '';

    document.getElementById('modal-atribuir').classList.add('show');
}

function _parseTratativaData(str) {
    if (!str) return null;
    const [d, m, a] = str.split('/').map(Number);
    if (!d || !m || !a) return null;
    return { ano: a, mes: m - 1, dia: d };
}

function fecharModalAtribuir() {
    document.getElementById('modal-atribuir').classList.remove('show');
    _atribuirOsId = null;
}

function fecharModalAtribuirOverlay(e) {
    if (e.target.id === 'modal-atribuir') fecharModalAtribuir();
}

function _renderAtribuirTecnicos() {
    const cont = document.getElementById('atribuir-tec-lista');
    if (tecnicos.length === 0) {
        cont.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:8px">Nenhum técnico cadastrado.</p>';
        return;
    }
    cont.innerHTML = tecnicos.map(tec => {
        const [cor, bg] = corPara(tec.id);
        const ini = iniciais(tec.nome);
        const sel = _atribuirTecIds.includes(tec.id) ? 'selected' : '';
        return `
        <button class="atribuir-tec-item ${sel}" onclick="_selecionarTecAtribuir(${tec.id})">
            <div class="avatar-mini" style="background:${bg};color:${cor};border:1px solid ${cor}40;width:34px;height:34px;font-size:13px">${ini}</div>
            <div>
                <div class="atribuir-tec-nome">${tec.nome}</div>
                <div class="atribuir-tec-funcao">${tec.funcao}</div>
            </div>
            <svg class="atribuir-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        </button>`;
    }).join('');
}

function _selecionarTecAtribuir(id) {
    if (_atribuirTecIds.includes(id)) {
        _atribuirTecIds = _atribuirTecIds.filter(t => t !== id);
    } else {
        _atribuirTecIds.push(id);
    }
    _renderAtribuirTecnicos();
}

function atribuirCalMes(delta) {
    _atribuirCalMes += delta;
    if (_atribuirCalMes > 11) { _atribuirCalMes = 0; _atribuirCalAno++; }
    if (_atribuirCalMes < 0)  { _atribuirCalMes = 11; _atribuirCalAno--; }
    _renderAtribuirCalendario();
}

function _renderAtribuirCalendario() {
    const hoje = new Date();
    const hojeDia = hoje.getDate();
    const hojeMes = hoje.getMonth();
    const hojeAno = hoje.getFullYear();

    document.getElementById('atribuir-mes-titulo').textContent =
        `${MESES[_atribuirCalMes]} ${_atribuirCalAno}`;

    const primeiroDia  = new Date(_atribuirCalAno, _atribuirCalMes, 1).getDay();
    const totalDias    = new Date(_atribuirCalAno, _atribuirCalMes + 1, 0).getDate();
    const totalDiasAnt = new Date(_atribuirCalAno, _atribuirCalMes, 0).getDate();

    let html = '';
    for (let i = primeiroDia - 1; i >= 0; i--)
        html += `<button class="cal-dia cal-dia--outro-mes" disabled style="font-size:11px">${totalDiasAnt - i}</button>`;

    for (let d = 1; d <= totalDias; d++) {
        const eHoje = d === hojeDia && _atribuirCalMes === hojeMes && _atribuirCalAno === hojeAno;
        const eSel  = _atribuirData &&
                      _atribuirData.dia === d &&
                      _atribuirData.mes === _atribuirCalMes &&
                      _atribuirData.ano === _atribuirCalAno;
        let cls = 'cal-dia';
        if (eSel)       cls += ' cal-dia--selecionado';
        else if (eHoje) cls += ' cal-dia--hoje';
        html += `<button class="${cls}" onclick="_selecionarDiaAtribuir(${d})" style="font-size:11px">${d}</button>`;
    }

    const celulasUsadas = primeiroDia + totalDias;
    const resto = celulasUsadas % 7 === 0 ? 0 : 7 - (celulasUsadas % 7);
    for (let d = 1; d <= resto; d++)
        html += `<button class="cal-dia cal-dia--outro-mes" disabled style="font-size:11px">${d}</button>`;

    document.getElementById('atribuir-cal-grid').innerHTML = html;
}

function _selecionarDiaAtribuir(dia) {
    _atribuirData = { ano: _atribuirCalAno, mes: _atribuirCalMes, dia };
    _renderAtribuirCalendario();
}

function _renderAtribuirSlots() {
    const cont = document.getElementById('atribuir-slots');
    cont.innerHTML = SLOTS_HORA.map(h => {
        const sel = h === _atribuirHora ? 'selected' : '';
        return `<button class="slot-btn ${sel}" onclick="_selecionarSlot('${h}')">${h}</button>`;
    }).join('');
}

function _selecionarSlot(hora) {
    _atribuirHora = hora;
    document.getElementById('atribuir-hora-custom').value = '';
    _renderAtribuirSlots();
}

function atribuirHoraCustom(val) {
    _atribuirHora = val || null;
    document.querySelectorAll('#atribuir-slots .slot-btn').forEach(b => b.classList.remove('selected'));
}

function confirmarAtribuicao() {
    if (!_atribuirOsId) return;
    if (_atribuirTecIds.length === 0) {
        showToast('Selecione pelo menos um técnico.', 'error');
        return;
    }

    const tecsSelecionados = tecnicos.filter(t => _atribuirTecIds.includes(t.id));
    if (tecsSelecionados.length === 0) return;

    const os = historico.find(o => o.id === _atribuirOsId);
    if (!os) return;

    os.tecnicosIds = _atribuirTecIds;
    os.tecnico     = tecsSelecionados.map(t => t.nome).join(', ');
    os.tecnicoId   = _atribuirTecIds[0]; // Para garantir renderização de cor e compatibilidade
    os.status      = 'atribuida';

    if (_atribuirData) {
        const dataStr = `${String(_atribuirData.dia).padStart(2,'0')}/${String(_atribuirData.mes+1).padStart(2,'0')}/${_atribuirData.ano}`;
        os.tratativa = { data: dataStr, hora: _atribuirHora || '' };
    } else {
        os.tratativa = _atribuirHora ? { data: '', hora: _atribuirHora } : null;
    }

    localStorage.setItem(KEY_HISTORICO, JSON.stringify(historico));
    atualizarBadge();
    fecharModalAtribuir();
    renderOSsAbertas();
    showToast(`OS atribuída para ${tec.nome}!`, 'success');
}

// ── Inicializar ───────────────────────────────
atualizarBadge();
renderTecnicos();
mostrarTela('tela-home');
