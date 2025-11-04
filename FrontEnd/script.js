const apiUrl = 'http://localhost:5202/api/dashboard';
let dadosMensais = [];
let graficoEvolucao = null;
let graficoDespesas = null;

// Carregar meses do backend
async function carregarMeses() {
    try {
        const res = await fetch(`${apiUrl}/meses`);
        if (!res.ok) throw new Error("Erro ao buscar meses");

        dadosMensais = await res.json();
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
    const mes = document.getElementById("mesInput").value;
    const ano = parseInt(document.getElementById("anoInput").value);
    const receita = parseFloat(document.getElementById("receitaInput").value);
    const despesa = parseFloat(document.getElementById("despesaInput").value);
    const taxa = parseFloat(document.getElementById("taxaInput").value);

    if (!mes || isNaN(ano) || isNaN(receita) || isNaN(despesa) || isNaN(taxa)) {
        return alert("Preencha todos os campos corretamente!");
    }

    const novoMes = { mes, ano, receita, despesa, taxa, despesas: [] };

    try {
        const res = await fetch(`${apiUrl}/adicionar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoMes)
        });

        if (!res.ok) throw new Error('Erro ao adicionar mês');

        const data = await res.json();
        dadosMensais.push(data);
        atualizarGraficos();
        atualizarTabela();
        atualizarGraficoDespesas();

        document.getElementById("receitaInput").value = "";
        document.getElementById("despesaInput").value = "";
        document.getElementById("taxaInput").value = "";

    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

// Adicionar despesa distribuída
async function adicionarDespesa() {
    const mesAtual = dadosMensais[dadosMensais.length - 1];
    if (!mesAtual) return alert("Adicione um mês primeiro!");

    const nome = document.getElementById("nomeDespesaInput").value.trim();
    const valor = parseFloat(document.getElementById("valorDespesaInput").value);

    if (!nome || isNaN(valor)) return alert("Preencha corretamente!");

    // Limite da despesa total
    const somaDespesas = mesAtual.despesas.reduce((acc, d) => acc + d.valor, 0);
    if (somaDespesas + valor > mesAtual.despesa) {
        return alert("Não é possível adicionar. Excede a despesa total do mês!");
    }

    const despesa = { nome, valor };

    try {
        const res = await fetch(`${apiUrl}/adicionar-despesa/${mesAtual.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(despesa)
        });

        if (!res.ok) {
            const erro = await res.json();
            throw new Error(erro.message || "Erro ao adicionar despesa");
        }

        const data = await res.json();
        mesAtual.despesas.push(data);
        atualizarGraficoDespesas();

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
        atualizarGraficos();
        atualizarTabela();
        atualizarGraficoDespesas();
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

// Atualizar gráficos
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

    // Atualizar barra de taxa de cobrança
    const ultimaTaxa = dadosMensais.length ? dadosMensais[dadosMensais.length - 1].taxa : 0;
    document.getElementById("barraTaxa").style.width = `${ultimaTaxa}%`;
    document.getElementById("percentualTaxa").innerText = `${ultimaTaxa.toFixed(2)}%`;
}

// Atualizar gráfico de despesas
function atualizarGraficoDespesas() {
    const ctx = document.getElementById("graficoDespesas").getContext("2d");
    const mesAtual = dadosMensais[dadosMensais.length - 1];
    const titulo = document.getElementById("mesAnoUltimoMes");

    // Caso não tenha mês nenhum
    if (!mesAtual) {
        titulo.innerText = "Distribuição de Despesas — Nenhum mês adicionado";
        if (graficoDespesas) graficoDespesas.destroy();
        return;
    }

    // Atualiza o título com o último mês, mesmo que sem despesas
    titulo.innerText = `Distribuição de Despesas — ${mesAtual.mes}/${mesAtual.ano}`;

    const nomes = mesAtual.despesas.map(d => d.nome);
    const valores = mesAtual.despesas.map(d => d.valor);

    if (graficoDespesas) graficoDespesas.destroy();

    // Se ainda não há despesas, não exibe gráfico, mas mantém o título
    if (nomes.length === 0) return;

    graficoDespesas = new Chart(ctx, {
        type: "pie",
        data: {
            labels: nomes,
            datasets: [{
                data: valores,
                backgroundColor: [
                    "#3498db", "#9b59b6", "#1abc9c", "#e67e22",
                    "#e74c3c", "#2ecc71", "#f1c40f"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } }
        }
    });
}

// Atualizar tabela
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

// Eventos
document.getElementById("addMesBtn").addEventListener("click", adicionarMes);
document.getElementById("addDespesaBtn").addEventListener("click", adicionarDespesa);

// Inicialização
carregarMeses();
