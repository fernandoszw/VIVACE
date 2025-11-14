const apiListar = "http://localhost:5202/api/Dashboard/meses";

const billsPagosWrap = document.getElementById("billsPagos");
const billsPendentesWrap = document.getElementById("billsPendentes");
const mesSelect = document.getElementById("mesSelect");
const btnLoad = document.getElementById("btnLoad");

// carregar histórico completo do backend
async function loadHistorico(){
  billsPagosWrap.innerHTML = "<p>Carregando...</p>";
  billsPendentesWrap.innerHTML = "<p>Carregando...</p>";

  try {
    const res = await fetch(apiListar);
    if(!res.ok) throw new Error("Erro ao buscar histórico no servidor.");
    const data = await res.json();

    // gerar lista de meses (únicos)
    const meses = [...new Set(data.map(p => {
      const d = new Date(p.dataCriacao);
      return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}`;
    }))].sort().reverse();

    // preencher select se vazio
    if(mesSelect.options.length <= 1){
      meses.forEach(m=>{
        const [y,mm]=m.split("-");
        const nomeMes = new Date(y,mm-1).toLocaleString("pt-BR",{month:"long",year:"numeric"});
        const opt=document.createElement("option");
        opt.value=m;
        opt.textContent=nomeMes.charAt(0).toUpperCase()+nomeMes.slice(1);
        mesSelect.appendChild(opt);
      });
    }

    // filtrar mês selecionado
    const mesSelecionado = mesSelect.value || meses[0];
    const [year, month] = mesSelecionado.split("-").map(Number);
    const filtrados = data.filter(p=>{
      const d=new Date(p.dataCriacao);
      return d.getMonth()+1===month && d.getFullYear()===year;
    });

    renderHistorico(filtrados);
  } catch(err){
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

function renderBill(p, pago){
  const el=document.createElement("div");
  el.className="bill";
  el.innerHTML=`
    <div class="left">
      <div class="icon">${pago?"✅":"⏳"}</div>
      <div class="info">
        <h4>${p.descricao || "Pagamento"}</h4>
        <p>${new Date(p.dataCriacao).toLocaleDateString("pt-BR")}</p>
      </div>
    </div>
    <div class="right">
      <div class="amount">R$ ${p.valor.toFixed(2)}</div>
      <div class="status ${pago?"pago":"pendente"}">${pago?"Pago":"Pendente"}</div>
    </div>
  `;
  return el;
}

btnLoad.addEventListener("click",loadHistorico);
window.addEventListener("DOMContentLoaded",loadHistorico);
