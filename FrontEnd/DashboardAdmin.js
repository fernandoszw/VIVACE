const apiUrl = 'http://localhost:5202/api/dashboard';
let dadosMensais = [];
let graficoEvolucao = null;
let graficoDespesas = null;

// -------------------- Funções --------------------

// 🔗 Redirecionar para o Financeiro
document.getElementById("btnFinanceiro").addEventListener("click", () => {
  window.location.href = "FinanceiroAdmin.html";
});

// Gera anos automaticamente (2026 a 2035)
const anoSelect = document.getElementById("anoInput");
for (let ano = 2026; ano <= 2035; ano++) {
  const option = document.createElement("option");
  option.value = ano;
  option.textContent = ano;
  anoSelect.appendChild(option);
}

// Carregar meses do backend
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

// Adicionar mês
async function adicionarMes() {
    const mesSelect = document.getElementById("mesInput");
    const mes = mesSelect.value;
    const mesNumero = parseInt(mesSelect.selectedOptions[0].dataset.num);
    const ano = parseInt(document.getElementById("anoInput").value);
    const receita = parseFloat(document.getElementById("receitaInput").value);
    const despesa = parseFloat(document.getElementById("despesaInput").value);
    const taxa = parseFloat(document.getElementById("taxaInput").value);

    if (!mes || isNaN(ano) || isNaN(receita) || isNaN(despesa) || isNaN(taxa)) {
        return alert("Preencha todos os campos corretamente!");
    }

    const novoMes = { mes, mesNumero, ano, receita, despesa, taxa, despesas: [] };

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
        document.getElementById("taxaInput").value = "";
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

// Adicionar despesa
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

// Remover mês
async function removerMes(index) {
    const mes = dadosMensais[index];
    if (!mes) return;

    try {
        const res = await fetch(`${apiUrl}/remover/${mes.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao remover mês');

        dadosMensais.splice(index, 1);
        atualizarTabela();
        atualizarGraficos();
        atualizarGraficoDespesas();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

// Remover despesa individual
function removerDespesa(indexDespesa) {
    const mesAtual = dadosMensais[dadosMensais.length - 1];
    if (!mesAtual) return;

    mesAtual.despesas.splice(indexDespesa, 1);
    atualizarListaDespesas();
    atualizarGraficoDespesas();
}

// Atualizar tabela HTML
function atualizarTabela() {
    const tbody = document.querySelector("#tabelaMeses tbody");
    tbody.innerHTML = "";

    dadosMensais.forEach((m, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${m.mes}/${m.ano}</td>
            <td>R$ ${m.receita.toFixed(2)}</td>
            <td>R$ ${m.despesa.toFixed(2)}</td>
            <td>${m.taxa.toFixed(2)}%</td>
            <td><button onclick="removerMes(${i})">Remover</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Atualizar lista de despesas do último mês
function atualizarListaDespesas() {
    const ul = document.getElementById("listaDespesas");
    const mesAtual = dadosMensais[dadosMensais.length - 1];
    ul.innerHTML = "";

    if (!mesAtual) return;

    mesAtual.despesas.forEach((d, i) => {
        const li = document.createElement("li");
        li.innerHTML = `${d.nome} — R$ ${d.valor.toFixed(2)} <button onclick="removerDespesa(${i})">Remover</button>`;
        ul.appendChild(li);
    });
}

// Atualizar gráfico de evolução financeira
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

// Atualizar gráfico de distribuição de despesas
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

// Gera cor aleatória para gráfico de pizza
function gerarCorAleatoria() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
}

// -------------------- Eventos --------------------
document.getElementById("addMesBtn").addEventListener("click", adicionarMes);
document.getElementById("addDespesaBtn").addEventListener("click", adicionarDespesa);

// Inicialização
carregarMeses();
