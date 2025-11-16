const apiListar = "http://localhost:5202/api/Dashboard/meses";

const billsPagosWrap = document.getElementById("billsPagos");
const billsPendentesWrap = document.getElementById("billsPendentes");
const mesSelect = document.getElementById("mesSelect");
const btnLoad = document.getElementById("btnLoad");

// carregar histórico completo do backend
async function loadHistorico() {
  billsPagosWrap.innerHTML = "<p>Carregando...</p>";
  billsPendentesWrap.innerHTML = "<p>Carregando...</p>";

  try {
    const faturas = JSON.parse(localStorage.getItem("faturasGeradas")) || [];

    const pagos = faturas.filter(f => f.status === "Pago");
    const pendentes = faturas.filter(f => f.status !== "Pago");

    billsPagosWrap.innerHTML = "";
    billsPendentesWrap.innerHTML = "";

    pagos.forEach(p => billsPagosWrap.appendChild(renderBill(p, true)));
    pendentes.forEach(p => billsPendentesWrap.appendChild(renderBill(p, false)));

    if (pagos.length === 0) billsPagosWrap.innerHTML = "<p>Nenhum pagamento efetuado.</p>";
    if (pendentes.length === 0) billsPendentesWrap.innerHTML = "<p>Sem pendências neste mês.</p>";

  } catch (err) {
    billsPagosWrap.innerHTML = `<p style="color:red">${err.message}</p>`;
    billsPendentesWrap.innerHTML = "";
  }
}


function renderHistorico(lista){
  billsPagosWrap.innerHTML = "";
  billsPendentesWrap.innerHTML = "";

  const pagos = lista.filter(p=>p.pago);
  const pendentes = lista.filter(p=>!p.pago);

  pagos.forEach(p=>{
    billsPagosWrap.appendChild(renderBill(p,true));
  });
  pendentes.forEach(p=>{
    billsPendentesWrap.appendChild(renderBill(p,false));
  });

  if(pagos.length===0) billsPagosWrap.innerHTML = "<p>Nenhum pagamento efetuado.</p>";
  if(pendentes.length===0) billsPendentesWrap.innerHTML = "<p>Sem pendências neste mês.</p>";
}

function renderBill(f, pago) {
  const el = document.createElement("div");
  el.className = "bill";
  el.innerHTML = `
    <div class="left">
      <div class="icon">${pago ? "✅" : "⏳"}</div>
      <div class="info">
        <h4>${f.nome}</h4>
        <p>${f.venc}</p>
      </div>
    </div>
    <div class="right">
      <div class="amount">R$ ${f.valor.toFixed(2)}</div>
      <div class="status ${pago ? "pago" : "pendente"}">${pago ? "Pago" : "Pendente"}</div>
    </div>
  `;
  return el;
}


btnLoad.addEventListener("click",loadHistorico);
window.addEventListener("DOMContentLoaded",loadHistorico);
