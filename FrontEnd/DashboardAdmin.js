document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = 'http://localhost:5202/api/dashboard';
    let dadosMensais = [];
    let graficoEvolucao = null;
    let graficoDespesas = null;

    // -------------------- Redirecionamento --------------------
    const btnFinanceiro = document.getElementById("btnFinanceiro");
    if (btnFinanceiro) {
        btnFinanceiro.addEventListener("click", () => {
            window.location.href = "FinanceiroAdmin.html";
        });
    }

    // -------------------- Gerar anos --------------------
    const anoSelect = document.getElementById("anoInput");
    if (anoSelect) {
        for (let ano = 2026; ano <= 2035; ano++) {
            const option = document.createElement("option");
            option.value = ano;
            option.textContent = ano;
            anoSelect.appendChild(option);
        }
    }

    // -------------------- Funções CRUD Meses --------------------
    async function carregarMeses() {
        try {
            const res = await fetch(`${apiUrl}/meses`);
            if (!res.ok) throw new Error("Erro ao buscar meses");

            dadosMensais = await res.json();
            dadosMensais.sort((a, b) => a.ano - b.ano || a.mesNumero - b.mesNumero);
            atualizarTabela();
            atualizarGraficos();
            atualizarGraficoDespesas();
        } catch (err) {
            console.error(err);
            alert("Erro ao carregar meses");
        }
    }

    async function adicionarMes() {
        const mesSelect = document.getElementById("mesInput");
        const mes = mesSelect.value;
        const mesNumero = parseInt(mesSelect.selectedOptions[0].dataset.num);
        const ano = parseInt(document.getElementById("anoInput").value);
        const receita = parseFloat(document.getElementById("receitaInput").value);
        const despesa = parseFloat(document.getElementById("despesaInput").value);

        if (!mes || isNaN(ano) || isNaN(receita) || isNaN(despesa)) {
            return alert("Preencha todos os campos corretamente!");
        }

        // Inicializa taxa zerada
        const novoMes = { mes, mesNumero, ano, receita, despesa, despesas: [], taxa: 0 };

        try {
            const res = await fetch(`${apiUrl}/adicionar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoMes)
            });
            if (!res.ok) throw new Error('Erro ao adicionar mês');
            const data = await res.json();

            dadosMensais.push(data);
            dadosMensais.sort((a, b) => a.ano - b.ano || a.mesNumero - b.mesNumero);

            atualizarTabela();
            atualizarGraficos();
            atualizarGraficoDespesas();
            alert("Mês adicionado com sucesso!");

            mesSelect.value = "";
            document.getElementById("anoInput").value = "";
            document.getElementById("receitaInput").value = "";
            document.getElementById("despesaInput").value = "";

            // Barra zerada para o último mês
            document.getElementById("barraTaxa").style.width = "0%";
            document.getElementById("percentualTaxa").innerText = "0%";

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    }

    async function removerMes(id) {
        try {
            const res = await fetch(`${apiUrl}/remover/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Erro ao remover mês");

            dadosMensais = dadosMensais.filter(m => m.id !== id);
            atualizarTabela();
            atualizarGraficos();
            atualizarGraficoDespesas();
        } catch (err) {
            alert(err.message);
        }
    }

    // -------------------- Funções CRUD Despesas --------------------
    async function adicionarDespesa() {
        const mesAtual = dadosMensais[dadosMensais.length - 1];
        if (!mesAtual) return alert("Adicione um mês primeiro!");

        const nome = document.getElementById("nomeDespesaInput").value.trim();
        const valor = parseFloat(document.getElementById("valorDespesaInput").value);

        if (!nome || isNaN(valor)) return alert("Preencha corretamente!");

        const somaDespesas = mesAtual.despesas.reduce((acc, d) => acc + d.valor, 0);
        if (somaDespesas + valor > mesAtual.despesa) return alert("Excede a despesa total do mês!");

        try {
            const res = await fetch(`${apiUrl}/adicionar-despesa/${mesAtual.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, valor })
            });
            if (!res.ok) {
                const erro = await res.json();
                throw new Error(erro.message || "Erro ao adicionar despesa");
            }
            const data = await res.json();
            mesAtual.despesas.push(data);

            atualizarListaDespesas();
            atualizarGraficoDespesas();
            alert("Despesa adicionada com sucesso!");

            document.getElementById("nomeDespesaInput").value = "";
            document.getElementById("valorDespesaInput").value = "";
        } catch (err) {
            alert(err.message);
        }
    }

    function removerDespesa(index) {
        const mesAtual = dadosMensais[dadosMensais.length - 1];
        if (!mesAtual) return;

        mesAtual.despesas.splice(index, 1);
        atualizarListaDespesas();
        atualizarGraficoDespesas();
    }

    // -------------------- Atualização de UI --------------------
    function atualizarTabela() {
        const tbody = document.querySelector("#tabelaMeses tbody");
        tbody.innerHTML = "";

        dadosMensais.forEach((m) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${m.mes}/${m.ano}</td>
        <td>R$ ${m.receita.toFixed(2)}</td>
        <td>R$ ${m.despesa.toFixed(2)}</td>
        <td>${m.taxa.toFixed(2)}%</td>
        <td><button class="remover-mes-btn">Remover</button></td>
      `;
            tbody.appendChild(tr);

            tr.querySelector(".remover-mes-btn").addEventListener("click", () => removerMes(m.id));
        });
    }

    function atualizarListaDespesas() {
        const ul = document.getElementById("listaDespesas");
        ul.innerHTML = "";

        const mesAtual = dadosMensais[dadosMensais.length - 1];
        if (!mesAtual) return;

        mesAtual.despesas.forEach((d, i) => {
            const li = document.createElement("li");
            li.innerHTML = `${d.nome} — R$ ${d.valor.toFixed(2)} <button class="remover-despesa-btn">Remover</button>`;
            ul.appendChild(li);

            li.querySelector(".remover-despesa-btn").addEventListener("click", () => removerDespesa(i));
        });
    }

    function atualizarGraficos() {
        const ctx = document.getElementById("graficoEvolucao").getContext("2d");
        const meses = dadosMensais.map(x => `${x.mes}/${x.ano}`);
        const receitas = dadosMensais.map(x => x.receita);
        const despesas = dadosMensais.map(x => x.despesa);

        if (graficoEvolucao) graficoEvolucao.destroy();

        graficoEvolucao = new Chart(ctx, {
            type: "bar",
            data: {
                labels: meses,
                datasets: [
                    { label: "Receita (R$)", data: receitas, backgroundColor: "#27ae60" },
                    { label: "Despesa (R$)", data: despesas, backgroundColor: "#e74c3c" }
                ]
            },
            options: { responsive: true, plugins: { legend: { position: "bottom" } } }
        });

        const ultimaTaxa = dadosMensais.length ? dadosMensais[dadosMensais.length - 1].taxa : 0;
        document.getElementById("barraTaxa").style.width = `${ultimaTaxa}%`;
        document.getElementById("percentualTaxa").innerText = `${ultimaTaxa.toFixed(2)}%`;
    }

    function atualizarGraficoDespesas() {
        const ctx = document.getElementById("graficoDespesas").getContext("2d");
        const mesAtual = dadosMensais[dadosMensais.length - 1];
        const titulo = document.getElementById("mesAnoUltimoMes");

        if (!mesAtual) {
            titulo.innerText = "Distribuição de Despesas — Nenhum mês adicionado";
            if (graficoDespesas) graficoDespesas.destroy();
            return;
        }

        titulo.innerText = `Distribuição de Despesas — ${mesAtual.mes}/${mesAtual.ano}`;

        const nomes = mesAtual.despesas.map(d => d.nome);
        const valores = mesAtual.despesas.map(d => d.valor);
        const cores = mesAtual.despesas.map(() => gerarCorAleatoria());

        if (graficoDespesas) graficoDespesas.destroy();
        if (nomes.length === 0) return;

        graficoDespesas = new Chart(ctx, {
            type: "pie",
            data: { labels: nomes, datasets: [{ data: valores, backgroundColor: cores }] },
            options: { responsive: true, plugins: { legend: { position: "bottom" } } }
        });

        atualizarListaDespesas();
    }

    function gerarCorAleatoria() {
        return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
    }

    // -------------------- Modal Fatura --------------------
    function inicializarFatura() {
        const btnGerarFatura = document.querySelector(".btngerarfatura");
        if (!btnGerarFatura) return;

        let faturaModal = null;

        btnGerarFatura.addEventListener("click", () => {
            if (!faturaModal) {
                faturaModal = document.createElement("div");
                faturaModal.className = "modal";
                faturaModal.innerHTML = `
          <div class="modal-content">
            <h3>Nova Fatura</h3>
            <input type="text" id="faturaNome" placeholder="Nome da conta" />
            <input type="number" id="faturaValor" placeholder="Valor (R$)" />
            <div style="margin-top:10px; display:flex; justify-content:flex-end; gap:10px;">
              <button id="cancelFatura">Cancelar</button>
              <button id="confirmFatura">Adicionar</button>
            </div>
          </div>
        `;
                document.body.appendChild(faturaModal);

                Object.assign(faturaModal.style, {
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 9999
                });

                const modalContent = faturaModal.querySelector(".modal-content");
                Object.assign(modalContent.style, {
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "8px",
                    minWidth: "300px"
                });

                faturaModal.querySelector("#cancelFatura").addEventListener("click", () => {
                    faturaModal.remove();
                    faturaModal = null;
                });

                faturaModal.querySelector("#confirmFatura").addEventListener("click", () => {
                    const nome = document.getElementById("faturaNome").value.trim();
                    const valor = parseFloat(document.getElementById("faturaValor").value);

                    if (!nome || isNaN(valor)) return alert("Preencha o nome e o valor corretamente!");

                    const faturaDto = {
                        id: Date.now(),
                        nome,
                        valor,
                        unit: "Apt 101",
                        venc: new Date().toLocaleDateString(),
                        desc: "-",
                        status: "Pendente"
                    };

                    let faturasGeradas = JSON.parse(localStorage.getItem("faturasGeradas")) || [];
                    faturasGeradas.push(faturaDto);
                    localStorage.setItem("faturasGeradas", JSON.stringify(faturasGeradas));

                    alert(`Fatura "${nome}" adicionada!`);
                    faturaModal.remove();
                    faturaModal = null;

                    renderFaturas();
                });
            }
        });
    }

    function renderFaturas() {
        const billsWrap = document.getElementById("bills");
        if (!billsWrap) return;

        billsWrap.innerHTML = "";
        let total = 0;
        const faturas = JSON.parse(localStorage.getItem("faturasGeradas")) || [];

        faturas.forEach(f => {
            const el = document.createElement("div");
            el.className = "bill";
            el.innerHTML = `
        <div class="left">
          <div class="icon">🏠</div>
          <div class="info">
            <h4>${f.nome}</h4>
            <p>Vencimento: ${f.venc}</p>
          </div>
        </div>
        <div class="right">
          <div class="amount">R$ ${f.valor.toFixed(2)}</div>
          <div class="badge ${f.status.toLowerCase()}">${f.status}</div>
          <button class="pagar" data-id="${f.id}">Marcar como Pago</button>
          <button class="remover" data-id="${f.id}">Remover</button>
        </div>
      `;
            billsWrap.appendChild(el);
            total += f.valor;
        });

        document.getElementById("totalAmount").textContent = `R$ ${total.toFixed(2)}`;

        document.querySelectorAll(".remover").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                let faturas = JSON.parse(localStorage.getItem("faturasGeradas")) || [];
                faturas = faturas.filter(f => f.id !== id);
                localStorage.setItem("faturasGeradas", JSON.stringify(faturas));
                renderFaturas();
                atualizarIndicadores();
            });
        });

        document.querySelectorAll(".pagar").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = Number(btn.dataset.id);
                let faturas = JSON.parse(localStorage.getItem("faturasGeradas")) || [];
                const fatura = faturas.find(f => f.id === id);
                if (fatura) fatura.status = "Pago";
                localStorage.setItem("faturasGeradas", JSON.stringify(faturas));
                renderFaturas();
                atualizarIndicadores();
            });
        });

        atualizarIndicadores();
    }

    function atualizarIndicadores() {
        const faturas = JSON.parse(localStorage.getItem("faturasGeradas")) || [];

        const totalFaturas = faturas.length;
        const inadimplentesCount = faturas.filter(f => f.status !== "Pago").length;
        const totalUnidades = 10;

        const barraTaxa = document.getElementById("barraTaxa");
        const percentualTaxa = document.getElementById("percentualTaxa");
        const inadimplentes = document.getElementById("inadimplentes");
        const percentualInadimplentes = document.getElementById("percentualInadimplentes");

        const pagas = totalFaturas - inadimplentesCount;
        const taxa = totalFaturas > 0 ? (pagas / totalFaturas) * 100 : 0;

        barraTaxa.style.width = `${taxa.toFixed(2)}%`;
        percentualTaxa.innerText = `${taxa.toFixed(2)}%`;

        inadimplentes.innerText = `${inadimplentesCount} unidades`;
        percentualInadimplentes.innerText = `${totalUnidades > 0 ? ((inadimplentesCount / totalUnidades) * 100).toFixed(2) : 0}% do total`;
    }

    // -------------------- Modal Relatório de Inadimplência --------------------
    function abrirModalInadimplentes() {
        const faturas = JSON.parse(localStorage.getItem("faturasGeradas")) || [];
        const pendentes = faturas.filter(f => f.status !== "Pago");

        if (pendentes.length === 0) {
            return alert("Nenhuma fatura pendente!");
        }

        // Remove modal antigo se existir
        const antigoModal = document.getElementById("modalInadimplentes");
        if (antigoModal) antigoModal.remove();

        const modal = document.createElement("div");
        modal.id = "modalInadimplentes";
        modal.className = "modal";
        modal.innerHTML = `
      <div class="modal-content">
        <h3>Relatório de Inadimplência</h3>
        <div id="listaPendentes" style="max-height:300px; overflow-y:auto; margin-bottom:10px;"></div>
        <div style="display:flex; justify-content:flex-end;">
          <button id="fecharModalPendentes">Fechar</button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);

        // Estilos básicos do modal
        Object.assign(modal.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999
        });

        const modalContent = modal.querySelector(".modal-content");
        Object.assign(modalContent.style, {
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "300px"
        });

        // Preencher a lista de pendentes
        const listaDiv = document.getElementById("listaPendentes");
        pendentes.forEach(f => {
            const el = document.createElement("div");
            el.style.padding = "5px 0";
            el.innerText = `${f.nome} — R$ ${f.valor.toFixed(2)} — Venc.: ${f.venc}`;
            listaDiv.appendChild(el);
        });

        // Botão fechar
        document.getElementById("fecharModalPendentes").addEventListener("click", () => {
            modal.remove();
        });

        // Fechar clicando fora do modal
        modal.addEventListener("click", e => {
            if (e.target === modal) modal.remove();
        });
    }

    // -------------------- Evento indicador Inadimplentes --------------------
    const inadimplentesEl = document.getElementById("inadimplentes");
    if (inadimplentesEl) {
        inadimplentesEl.style.cursor = "pointer"; // indica que é clicável
        inadimplentesEl.addEventListener("click", abrirModalInadimplentes);
    }


    // -------------------- Eventos --------------------
    const addMesBtn = document.getElementById("addMesBtn");
    if (addMesBtn) addMesBtn.addEventListener("click", adicionarMes);

    const addDespesaBtn = document.getElementById("addDespesaBtn");
    if (addDespesaBtn) addDespesaBtn.addEventListener("click", adicionarDespesa);

    inicializarFatura();
    carregarMeses();
    renderFaturas();
});
