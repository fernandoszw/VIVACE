async function carregarInadimplencia() {
  const resp = await fetch('http://localhost:5202/api/pagamento/listar');
  const pagamentos = await resp.json();
  const tbody = document.getElementById("listaInadimplencia");
  tbody.innerHTML = "";

  const hoje = new Date();

  pagamentos.forEach(p => {
    const venc = new Date(p.vencimento);
    if (p.status === "Pendente" || venc < hoje) {
      const tr = document.createElement("tr");
      const valorFormatado = p.valor.toFixed(2).replace(".", ",");
      tr.innerHTML = `
        <td>${p.nomeConta}</td>
        <td>R$ ${valorFormatado}</td>
        <td>${venc.toLocaleDateString("pt-BR")}</td>
        <td>${p.status}</td>
        <td>
          <button class="pagar-btn" onclick="gerarPix(this, ${p.id}, '${p.nomeConta}', ${p.valor})">Pagar</button>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

async function gerarPix(botao, id, nome, valor) {
  if (botao.dataset.qrGerado) return;

  const resp = await fetch('http://localhost:5202/api/pagamento/gerar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ NomeConta: nome, Valor: valor })
  });

  const data = await resp.json();

  const container = document.createElement('div');
  container.className = 'qr-container';
  container.innerHTML = `
    <img src="data:image/png;base64,${data.qrCodeBase64}" />
    <textarea readonly>${data.pixCopiaCola}</textarea>
    <button class="pagar-btn">✅ Já paguei</button>
  `;
  botao.parentElement.appendChild(container);
  botao.dataset.qrGerado = true;

  container.querySelector('button').onclick = async () => {
    const respConfirm = await fetch(`http://localhost:5202/api/pagamento/confirmar/${id}`, { method: 'PUT' });
    if (respConfirm.ok) {
      alert('Pagamento confirmado!');
      botao.closest('tr').remove(); // remove da tabela Inadimplência
    } else {
      alert('Erro ao confirmar pagamento');
    }
  };
}

document.addEventListener("DOMContentLoaded", carregarInadimplencia);
