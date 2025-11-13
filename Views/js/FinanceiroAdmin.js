const apiUrl = "http://localhost:5202/api/dashboard";
let dadosTodos = [];
let grafico6Meses = null;

// redirecionar para Dashboard
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnDashboard");
  if (btn) btn.addEventListener("click", () => window.location.href = "DashboardAdmin.html");

  carregarFinanceiro();
});

async function carregarFinanceiro() {
  try {
    const res = await fetch(`${apiUrl}/meses`);
    if (!res.ok) throw new Error("Erro ao buscar meses");
    const dados = await res.json();

    // garantir ordenação por ano e mesNumero
    dados.sort((a, b) => a.ano - b.ano || (a.mesNumero ?? 0) - (b.mesNumero ?? 0));
    dadosTodos = dados;

    atualizarGrafico6Meses(dadosTodos);
    atualizarResumo(dadosTodos);
    atualizarListaDespesas(dadosTodos);
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar informações financeiras.");
  }
}

/* ---------- GRÁFICO: últimos 6 meses ---------- */
function atualizarGrafico6Meses(dados) {
  const ultimos6 = dados.slice(-6);
  const ctx = document.getElementById("graficoEvolucao6Meses").getContext("2d");

  const labels = ultimos6.map(x => `${x.mes}/${x.ano}`);
  const receitas = ultimos6.map(x => x.receita);
  const despesas = ultimos6.map(x => x.despesa);

  if (grafico6Meses) grafico6Meses.destroy();

  grafico6Meses = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Receita (R$)",
          data: receitas,
          borderColor: "#27ae60",
          backgroundColor: "rgba(39,174,96,0.15)",
          fill: true,
          tension: 0.35
        },
        {
          label: "Despesa (R$)",
          data: despesas,
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231,76,60,0.12)",
          fill: true,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/* ---------- RESUMO DO ÚLTIMO MÊS ---------- */
function atualizarResumo(dados) {
  if (!dados || dados.length === 0) {
    document.getElementById("tituloResumo").textContent = "Nenhum mês adicionado";
    return;
  }

  const ultimo = dados[dados.length - 1];
  const saldo = (ultimo.receita || 0) - (ultimo.despesa || 0);

  document.getElementById("tituloResumo").textContent = `Resumo ${ultimo.mes} ${ultimo.ano}`;
  document.getElementById("totalReceita").textContent = formatar(ultimo.receita || 0);
  document.getElementById("totalDespesa").textContent = formatar(ultimo.despesa || 0);
  document.getElementById("saldoMes").textContent = formatar(saldo);
  // se sua API não entrega fundoReserva, aqui usei 10% da receita como exemplo (ajuste se quiser)
  const fundo = ultimo.fundoReserva ?? Math.round((ultimo.receita || 0) * 0.10);
  document.getElementById("fundoReserva").textContent = formatar(fundo);
}

/* ---------- LISTA PRINCIPAIS DESPESAS (estilo tabela com barras) ---------- */
function atualizarListaDespesas(dados) {
  const container = document.getElementById("listaPrincipaisDespesas");
  container.innerHTML = "";

  if (!dados || dados.length === 0) {
    container.innerHTML = "<p>Nenhuma informação disponível.</p>";
    return;
  }

  const ultimo = dados[dados.length - 1];
  if (!ultimo.despesas || ultimo.despesas.length === 0) {
    container.innerHTML = "<p>Nenhuma despesa adicionada.</p>";
    return;
  }

  // Ordenar em ordem crescente (menor -> maior)
  const despesasOrdenadas = [...ultimo.despesas].sort((a, b) => a.valor - b.valor);

  // total para cálculo percentual (usamos campo despesa do mês para normalizar)
  const totalDoMes = ultimo.despesa > 0 ? ultimo.despesa : despesasOrdenadas.reduce((s, d) => s + d.valor, 0);

  despesasOrdenadas.forEach(d => {
    const percent = totalDoMes > 0 ? (d.valor / totalDoMes) * 100 : 0;
    const item = document.createElement("div");
    item.className = "item-despesa";

    item.innerHTML = `
      <div class="nome">${escapeHtml(d.nome)}</div>
      <div class="barra-wrap"><div class="preenchimento" style="width:${percent}%;"></div></div>
      <div class="valor">${formatar(d.valor)}</div>
    `;
    container.appendChild(item);
  });
}

/* ---------- util ---------- */
function formatar(n) {
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// simples escape para nomes vindos do backend
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
