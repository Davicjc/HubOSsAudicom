
        // ── ESTADO & PERSISTÊNCIA ──
        let state = {
            tecnicos: [
                { id: 1, nome: 'Carlos Silva', funcao: 'Fibra', cor: '#3b82f6' },
                { id: 2, nome: 'Ana Souza', funcao: 'Rádio', cor: '#10b981' }
            ],
            oss: [],
            contadorId: 100,
            usuarioLogado: null // { tipo: 'gestor' | 'tecnico', id: null }
        };

        function salvarState() { localStorage.setItem('hubos_v1', JSON.stringify(state)); }
        function carregarState() {
            try {
                const saved = localStorage.getItem('hubos_v1');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    state.tecnicos = parsed.tecnicos || state.tecnicos;
                    state.oss = parsed.oss || state.oss;
                    state.contadorId = parsed.contadorId || state.contadorId;
                    state.usuarioLogado = parsed.usuarioLogado !== undefined ? parsed.usuarioLogado : null;
                }
            } catch(e) { console.error('Erro ao ler state', e); }
        }

        // ── MAPA ──
        let mapa, markerGroup;
        function initMap() {
            if (mapa) return;
            const container = document.getElementById('mapa-atribuicao');
            if (!container) return;
            mapa = L.map('mapa-atribuicao').setView([-18.91, -48.27], 12);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(mapa);
            markerGroup = L.featureGroup().addTo(mapa);
        }

        // ── ASSINATURA ──
        let canvas, ctx, isDrawing = false;
        function initAssinatura() {
            canvas = document.getElementById('signature-pad');
            if (!canvas) return;
            ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#1e293b';

            const start = (e) => { isDrawing = true; ctx.beginPath(); ctx.moveTo(getX(e), getY(e)); e.preventDefault(); };
            const move = (e) => { if(isDrawing){ ctx.lineTo(getX(e), getY(e)); ctx.stroke(); } e.preventDefault(); };
            const end = () => { isDrawing = false; };

            const getX = (e) => e.touches ? e.touches[0].clientX - canvas.getBoundingClientRect().left : e.offsetX;
            const getY = (e) => e.touches ? e.touches[0].clientY - canvas.getBoundingClientRect().top : e.offsetY;

            canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); canvas.addEventListener('mouseup', end);
            canvas.addEventListener('touchstart', start); canvas.addEventListener('touchmove', move); canvas.addEventListener('touchend', end);
        }
        function limparAssinatura() { if(ctx) ctx.clearRect(0,0,canvas.width,canvas.height); }

        // ── NAVEGAÇÃO ──
        function showView(id) {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }
        function switchTab(id) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            
            document.querySelectorAll('nav button[id^="btn-tab-"]').forEach(b => {
                b.classList.remove('border-indigo-500', 'text-indigo-400');
                b.classList.add('border-transparent', 'text-slate-400');
            });
            const btn = document.getElementById('btn-' + id);
            if(btn) {
                btn.classList.remove('border-transparent', 'text-slate-400');
                btn.classList.add('border-indigo-500', 'text-indigo-400');
            }

            if(id === 'tab-os') {
                setTimeout(() => { if(mapa) mapa.invalidateSize(); else initMap(); renderMapaOSs(); }, 200);
            }
        }

        // ── LOGIN ──
        function loginGestor() {
            state.usuarioLogado = { tipo: 'gestor' }; salvarState();
            bootGestor();
        }
        function mostrarLoginTecnico() {
            const list = document.getElementById('tech-list-login');
            list.innerHTML = state.tecnicos.map(t => `
                <button onclick="loginTecnico(${t.id})" class="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style="background:${t.cor}">${t.nome[0]}</div>
                    <div><div class="font-bold text-sm">${t.nome}</div><div class="text-xs text-slate-400">${t.funcao}</div></div>
                </button>
            `).join('');
            document.getElementById('tech-login-select').classList.remove('hidden');
        }
        function loginTecnico(id) {
            state.usuarioLogado = { tipo: 'tecnico', id }; salvarState();
            bootTecnico();
        }
        function logout() {
            state.usuarioLogado = null; salvarState();
            showView('view-login');
        }

        // ── GESTOR BOOT ──
        function bootGestor() {
            showView('view-gestor');
            switchTab('tab-dashboard');
            atualizarDashboard();
            renderFilaLateral('aberta');
            renderTecnicosCards();
        }

        function atualizarDashboard() {
            const abertas = state.oss.filter(o => o.status === 'aberta').length;
            const atribuidas = state.oss.filter(o => o.status === 'atribuida').length;
            const concluidas = state.oss.filter(o => o.status === 'fechada').length;
            document.getElementById('stat-abertas').textContent = abertas;
            document.getElementById('stat-atribuidas').textContent = atribuidas;
            document.getElementById('stat-concluidas').textContent = concluidas;
            document.getElementById('stat-tecnicos').textContent = state.tecnicos.length;
            document.getElementById('badge-pendentes').textContent = abertas + atribuidas;
        }

        function criarOS(e) {
            e.preventDefault();
            const os = {
                id: state.contadorId++,
                cliente: document.getElementById('os-cliente').value,
                ponto: document.getElementById('os-ponto').value,
                telefone: document.getElementById('os-telefone').value,
                coords: document.getElementById('os-coords').value || '-18.91, -48.27',
                falha: document.getElementById('os-falha').value,
                status: 'aberta',
                dataCriacao: new Date().toLocaleDateString(),
                tecnicosIds: [],
                tratativa: null // { data, hora }
            };
            state.oss.push(os);
            salvarState();
            e.target.reset();
            atualizarDashboard();
            renderFilaLateral('aberta');
            alert('OS Criada com sucesso!');
        }

        function criarTecnico(e) {
            e.preventDefault();
            const cores = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];
            state.tecnicos.push({
                id: Date.now(),
                nome: document.getElementById('tec-nome').value,
                funcao: document.getElementById('tec-funcao').value,
                cor: cores[Math.floor(Math.random() * cores.length)]
            });
            salvarState();
            e.target.reset();
            renderTecnicosCards();
            atualizarDashboard();
        }

        // ── FILA & ATRIBUIÇÃO ──
        let filtroOSAtual = 'aberta';
        function filtrarFilaOS(status) {
            filtroOSAtual = status;
            ['aberta','atribuida','fechada'].forEach(s => {
                const btn = document.getElementById('btn-fila-' + s);
                if(s === status) {
                    btn.classList.remove('bg-slate-800','text-slate-400');
                    btn.classList.add('bg-indigo-500','text-white');
                } else {
                    btn.classList.add('bg-slate-800','text-slate-400');
                    btn.classList.remove('bg-indigo-500','text-white');
                }
            });
            renderFilaLateral(status);
        }

        function renderFilaLateral(status) {
            const lista = state.oss.filter(o => o.status === status);
            const cont = document.getElementById('lista-os-lateral');
            if(lista.length === 0) {
                cont.innerHTML = '<p class="text-center text-xs text-slate-500 mt-4">Nenhuma OS encontrada</p>';
                return;
            }
            cont.innerHTML = lista.map(os => {
                const cor = status==='aberta'?'#f59e0b':status==='fechada'?'#10b981':'#3b82f6';
                let tecsStr = '';
                if(os.tecnicosIds && os.tecnicosIds.length > 0) {
                    const nomes = os.tecnicosIds.map(tid => state.tecnicos.find(t=>t.id===tid)?.nome).filter(Boolean);
                    const dh = os.tratativa ? `${os.tratativa.data} ${os.tratativa.hora}` : '';
                    tecsStr = `<div class="text-[10px] mt-1 text-slate-400"><i class="fas fa-users text-indigo-400"></i> ${nomes.join(', ')} <br>🗓 ${dh}</div>`;
                }
                return `
                <div onclick="abrirPainelAtribuicao(${os.id})" class="bg-slate-800/50 border border-slate-700 p-3 rounded-xl cursor-pointer hover:border-indigo-500 transition">
                    <div class="flex justify-between items-start mb-1">
                        <strong class="text-sm font-bold truncate max-w-[70%]">${os.cliente}</strong>
                        <span class="w-2 h-2 rounded-full mt-1" style="background:${cor}"></span>
                    </div>
                    <p class="text-xs text-slate-400 truncate">${os.falha}</p>
                    ${tecsStr}
                </div>`;
            }).join('');
            renderMapaOSs();
        }

        let _atribTecs = [], _atribData = '', _atribHora = '';
        function abrirPainelAtribuicao(id) {
            const os = state.oss.find(o => o.id === id);
            if(!os) return;
            
            _atribTecs = os.tecnicosIds ? [...os.tecnicosIds] : [];
            _atribData = os.tratativa ? os.tratativa.data : new Date().toLocaleDateString('pt-BR');
            _atribHora = os.tratativa ? os.tratativa.hora : '08:00';

            const p = document.getElementById('painel-atribuicao');
            p.innerHTML = `
                <div class="flex justify-between items-start border-b border-slate-700 pb-4 mb-4">
                    <div>
                        <h3 class="font-black text-xl text-indigo-400">#${os.id} - ${os.cliente}</h3>
                        <p class="text-sm text-slate-300"><i class="fas fa-map-marker-alt text-rose-400 mr-1"></i> ${os.ponto}</p>
                        <p class="text-xs text-slate-400 mt-1">${os.falha}</p>
                    </div>
                    ${os.status !== 'fechada' ? `<button onclick="fecharOSGestor(${os.id})" class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold hover:bg-emerald-500 hover:text-white transition"><i class="fas fa-check"></i> Encerrar OS</button>` : ''}
                </div>

                ${os.status === 'fechada' ? `<div class="bg-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-4"><i class="fas fa-check-circle mr-2"></i>OS Concluída. Notas: ${os.notasExecucao || 'N/A'}</div>` : `
                
                <h4 class="font-bold text-sm mb-3">1. Selecione os Técnicos</h4>
                <div class="flex flex-wrap gap-2 mb-6" id="wrap-tecs-atrib">
                    ${state.tecnicos.map(t => {
                        const sel = _atribTecs.includes(t.id);
                        return `<button onclick="toggleTecAtrib(${t.id}, ${os.id})" class="px-3 py-1.5 rounded-full border ${sel ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400'} text-xs font-bold transition flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full" style="background:${t.cor}"></span> ${t.nome}
                        </button>`;
                    }).join('')}
                </div>

                <h4 class="font-bold text-sm mb-3">2. Agendamento</h4>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Data</label>
                        <input type="text" id="inp-atrib-data" value="${_atribData}" placeholder="DD/MM/AAAA" class="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-xs text-slate-400 mb-1">Hora</label>
                        <input type="time" id="inp-atrib-hora" value="${_atribHora}" class="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500">
                    </div>
                </div>

                <button onclick="salvarAtribuicao(${os.id})" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition flex justify-center items-center gap-2">
                    <i class="fas fa-save"></i> Salvar Atribuição
                </button>
                `}
            `;

            // Center map on OS
            if(mapa && os.coords) {
                const [lat, lng] = os.coords.split(',').map(Number);
                if(lat && lng) mapa.setView([lat, lng], 14);
            }
        }

        function toggleTecAtrib(tecId, osId) {
            if(_atribTecs.includes(tecId)) _atribTecs = _atribTecs.filter(id => id !== tecId);
            else _atribTecs.push(tecId);
            abrirPainelAtribuicao(osId);
        }

        function salvarAtribuicao(osId) {
            const os = state.oss.find(o => o.id === osId);
            if(!os) return;
            if(_atribTecs.length === 0) return alert('Selecione pelo menos 1 técnico');
            
            os.tecnicosIds = _atribTecs;
            os.tratativa = { 
                data: document.getElementById('inp-atrib-data').value,
                hora: document.getElementById('inp-atrib-hora').value
            };
            os.status = 'atribuida';
            salvarState();
            atualizarDashboard();
            filtrarFilaOS('atribuida'); // Vai re-renderizar e mudar a aba de filtro
            abrirPainelAtribuicao(osId);
            alert('Atribuído com sucesso!');
        }

        function fecharOSGestor(osId) {
            if(!confirm('Encerrar esta OS manualmente?')) return;
            const os = state.oss.find(o => o.id === osId);
            if(!os) return;
            os.status = 'fechada';
            os.notasExecucao = "Encerrada via painel do gestor";
            salvarState();
            atualizarDashboard();
            filtrarFilaOS('fechada');
            abrirPainelAtribuicao(osId);
        }

        function renderMapaOSs() {
            if(!mapa || !markerGroup) return;
            markerGroup.clearLayers();
            const lista = state.oss.filter(o => o.status === filtroOSAtual);
            lista.forEach(os => {
                if(!os.coords) return;
                const [lat, lng] = os.coords.split(',').map(Number);
                if(!lat || !lng) return;
                const cor = os.status==='aberta'?'#f59e0b':os.status==='fechada'?'#10b981':'#3b82f6';
                const circle = L.circleMarker([lat, lng], {
                    radius: 8, fillColor: cor, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
                });
                circle.bindPopup(`<strong style="color:#0f172a">${os.cliente}</strong><br><span style="color:#475569;font-size:11px">${os.falha}</span>`).on('click', () => abrirPainelAtribuicao(os.id));
                markerGroup.addLayer(circle);
            });
            if(lista.length > 0) mapa.fitBounds(markerGroup.getBounds(), {padding:[30,30]});
        }

        // ── AGENDA TÉCNICOS ──
        function renderTecnicosCards() {
            const cont = document.getElementById('lista-tecnicos-cards');
            if(!cont) return;
            
            const hojeData = new Date().toLocaleDateString('pt-BR');

            cont.innerHTML = state.tecnicos.map(t => {
                // OSs do tecnico pra hoje
                const osTec = state.oss.filter(o => o.tecnicosIds && o.tecnicosIds.includes(t.id) && o.tratativa && o.tratativa.data === hojeData && o.status !== 'fechada');
                
                return `
                <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg" style="background:${t.cor}">${t.nome[0]}</div>
                        <div>
                            <h4 class="font-bold leading-none">${t.nome}</h4>
                            <span class="text-xs text-slate-400">${t.funcao}</span>
                        </div>
                    </div>
                    <div class="border-t border-slate-700 pt-3">
                        <p class="text-xs font-bold text-slate-500 uppercase mb-2">Agenda de Hoje (${osTec.length})</p>
                        <div class="space-y-2">
                            ${osTec.length === 0 ? '<p class="text-xs text-slate-400">Livre</p>' : osTec.map(o => `
                                <div class="bg-slate-900 rounded p-2 text-xs border-l-2" style="border-color:${t.cor}">
                                    <div class="flex justify-between text-slate-300 font-bold mb-0.5"><span>${o.tratativa.hora}</span> <span class="text-[10px] bg-indigo-500/20 text-indigo-400 px-1 rounded">OS-${o.id}</span></div>
                                    <div class="truncate text-slate-400">${o.cliente}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
            }).join('');
        }


        // ── TÉCNICO APP ──
        function bootTecnico() {
            showView('view-tecnico');
            const tec = state.tecnicos.find(t => t.id === state.usuarioLogado.id);
            if(!tec) return logout();
            
            document.getElementById('tec-app-nome').textContent = tec.nome;
            document.getElementById('tec-app-avatar').textContent = tec.nome[0];
            document.getElementById('tec-app-avatar').style.background = tec.cor;

            renderTecAppLista();
            initAssinatura();
        }

        function renderTecAppLista() {
            const cont = document.getElementById('tec-app-lista');
            const tecId = state.usuarioLogado.id;
            const hoje = new Date().toLocaleDateString('pt-BR');

            // Pegar OSs do tecnico hoje
            let oss = state.oss.filter(o => o.tecnicosIds && o.tecnicosIds.includes(tecId) && o.tratativa && o.tratativa.data === hoje);
            
            // Sort by time
            oss.sort((a,b) => a.tratativa.hora.localeCompare(b.tratativa.hora));

            if(oss.length === 0) {
                cont.innerHTML = `
                <div class="glass-panel p-8 rounded-2xl text-center border-t border-t-emerald-500/30">
                    <i class="fas fa-mug-hot text-4xl text-slate-500 mb-3"></i>
                    <h3 class="font-bold text-slate-300">Tudo limpo!</h3>
                    <p class="text-sm text-slate-500 mt-1">Sua agenda de hoje está vazia.</p>
                </div>`;
                return;
            }

            cont.innerHTML = oss.map(os => {
                const isConcluida = os.status === 'fechada';
                return `
                <div class="glass-card p-4 rounded-xl relative overflow-hidden ${isConcluida ? 'opacity-60' : ''}">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 ${isConcluida ? 'bg-emerald-500' : 'bg-indigo-500'}"></div>
                    <div class="flex justify-between items-start mb-2 pl-2">
                        <div class="font-black text-lg text-slate-200 leading-tight">${os.cliente}</div>
                        <div class="text-sm font-bold bg-slate-800 px-2 py-0.5 rounded text-indigo-400">${os.tratativa.hora}</div>
                    </div>
                    <div class="pl-2 space-y-1 mb-4">
                        <div class="text-xs text-slate-400"><i class="fas fa-map-marker-alt text-rose-400 w-4 text-center"></i> ${os.ponto}</div>
                        <div class="text-xs text-slate-400"><i class="fas fa-exclamation-triangle text-amber-400 w-4 text-center"></i> ${os.falha}</div>
                    </div>
                    <div class="pl-2">
                        ${isConcluida ? 
                        `<div class="w-full text-center py-2 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-lg border border-emerald-500/20"><i class="fas fa-check-circle mr-1"></i> Concluído</div>` 
                        : `<button onclick="abrirExecucao(${os.id})" class="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm transition active:scale-95"><i class="fas fa-play mr-1"></i> Iniciar Atendimento</button>`}
                    </div>
                </div>`;
            }).join('');
        }

        function abrirExecucao(id) {
            const os = state.oss.find(o => o.id === id);
            if(!os) return;
            document.getElementById('exec-os-id').value = os.id;
            document.getElementById('exec-cliente').textContent = os.cliente;
            document.getElementById('exec-hora').textContent = "Agendado: " + os.tratativa.hora;
            document.getElementById('exec-falha').textContent = os.falha;
            document.getElementById('exec-endereco').textContent = os.ponto;
            document.getElementById('exec-telefone').textContent = os.telefone;
            document.getElementById('exec-notas').value = '';
            
            if(os.coords) {
                const q = encodeURIComponent(os.coords);
                document.getElementById('exec-map-btn').href = `https://www.google.com/maps/search/?api=1&query=${q}`;
            }

            limparAssinatura();
            document.getElementById('modal-exec-os').classList.remove('hidden');
            document.getElementById('modal-exec-os').classList.add('flex');
            
            // Ajustar canvas timeout para renderizar certo
            setTimeout(() => { if(canvas){ canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; } }, 100);
        }

        function fecharModalExec() {
            document.getElementById('modal-exec-os').classList.add('hidden');
            document.getElementById('modal-exec-os').classList.remove('flex');
        }

        function salvarExecucao() {
            const id = parseInt(document.getElementById('exec-os-id').value);
            const notas = document.getElementById('exec-notas').value;
            if(notas.length < 5) return alert('Preencha o resumo do reparo corretamente.');
            
            const os = state.oss.find(o => o.id === id);
            if(!os) return;

            os.status = 'fechada';
            os.notasExecucao = notas;
            
            salvarState();
            fecharModalExec();
            renderTecAppLista();
        }

        // ── INIT ──
        window.onload = () => {
            carregarState();
            if(state.usuarioLogado) {
                if(state.usuarioLogado.tipo === 'gestor') bootGestor();
                else bootTecnico();
            } else {
                showView('view-login');
            }
        };

    