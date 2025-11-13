async function carregarHistorico() {
  const resp = await fetch('http://localhost:5202/api/pagamento/listar');
  const pagamentos = await resp.json();
  const tbody = document.getElementById("listaPagamentos");
  tbody.innerHTML = "";

  pagamentos.forEach(p => {
    if (p.status === "Pago") {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nomeConta}</td>
        <td>R$ ${p.valor.toFixed(2).replace(".", ",")}</td>
        <td>${new Date(p.dataPagamento).toLocaleDateString("pt-BR")}</td>
        <td>${p.metodo}</td>
        <td>${p.status}</td>
        <td><button class="pago" disabled>Pago</button></td>
      `;
      tbody.appendChild(tr);
    }
  });
}

document.addEventListener("DOMContentLoaded", carregarHistorico);
