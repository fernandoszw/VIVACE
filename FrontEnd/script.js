const API_BASE = "http://localhost:5202/api";
document.getElementById("apiUrlDisplay").textContent = API_BASE;

function fmtMoney(v){ return "R$ " + Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2}); }
function setStatus(msg,ok=true){
  const el=document.getElementById("status");
  el.textContent=msg; el.className=ok?"ok":"error";
}
function clearStatus(){ setStatus("",true); }

/* DASHBOARD */
async function fetchResumo(){
  try{
    const r=await fetch(`${API_BASE}/dashboard/resumo`);
    const d=await r.json();
    document.getElementById("receitaCard").textContent=fmtMoney(d.receitaMensal||d.ReceitaMensal||0);
    document.getElementById("despesaCard").textContent=fmtMoney(d.despesaMensal||d.DespesaMensal||0);
    document.getElementById("inadimplentesCard").textContent=d.unidadesInadimplentes||0;
  }catch(e){setStatus("Erro resumo: "+e.message,false);}
}
async function fetchEvolucao(){
  const t=document.querySelector("#evolucaoTable tbody");
  try{
    const r=await fetch(`${API_BASE}/dashboard/evolucao`);
    const d=await r.json();
    t.innerHTML="";
    d.forEach(i=>{
      t.innerHTML+=`<tr><td>${i.mes||i.Mes}</td><td>${fmtMoney(i.receita||i.Receita)}</td><td>${fmtMoney(i.despesa||i.Despesa)}</td></tr>`;
    });
  }catch(e){t.innerHTML=`<tr><td colspan=3>Erro: ${e.message}</td></tr>`;}
}

/* RECEITAS CRUD */
const tbody=document.querySelector("#tabelaReceitas tbody");
async function listarReceitas(){
  tbody.innerHTML="<tr><td colspan=5>Carregando...</td></tr>";
  try{
    const r=await fetch(`${API_BASE}/receitas`);
    const d=await r.json();
    tbody.innerHTML="";
    d.forEach(r=>{
      tbody.innerHTML+=`
      <tr>
        <td>${r.id}</td>
        <td>${r.descricao}</td>
        <td>${fmtMoney(r.valor)}</td>
        <td>${r.data?new Date(r.data).toLocaleDateString():""}</td>
        <td>
          <button class="btn ghost" onclick="editar(${r.id},'${r.descricao}',${r.valor})">Editar</button>
          <button class="btn" onclick="deletar(${r.id})">Del</button>
        </td>
      </tr>`;
    });
  }catch(e){tbody.innerHTML=`<tr><td colspan=5>Erro: ${e.message}</td></tr>`;}
}

async function salvar(e){
  e.preventDefault();
  const id=document.getElementById("receitaId").value;
  const body={
    descricao:document.getElementById("descricao").value,
    valor:parseFloat(document.getElementById("valor").value),
    data:document.getElementById("data").value||new Date().toISOString()
  };
  try{
    let res;
    if(id)
      res=await fetch(`${API_BASE}/receitas/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    else
      res=await fetch(`${API_BASE}/receitas`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!res.ok) throw new Error(res.status);
    setStatus(id?"Atualizada!":"Adicionada!");
    e.target.reset(); document.getElementById("receitaId").value="";
    listarReceitas(); fetchResumo(); fetchEvolucao();
  }catch(err){setStatus("Erro: "+err.message,false);}
}
document.getElementById("formReceita").addEventListener("submit",salvar);

function editar(id,desc,val){ 
  document.getElementById("receitaId").value=id;
  document.getElementById("descricao").value=desc;
  document.getElementById("valor").value=val;
}
async function deletar(id){
  if(!confirm("Deletar receita?"))return;
  await fetch(`${API_BASE}/receitas/${id}`,{method:"DELETE"});
  listarReceitas(); fetchResumo(); fetchEvolucao();
}

/* UNIDADES */
async function listarUnidades(){
  const t=document.querySelector("#tabelaUnidades tbody");
  try{
    const r=await fetch(`${API_BASE}/unidades`);
    const d=await r.json();
    t.innerHTML="";
    d.forEach(u=>{
      t.innerHTML+=`<tr><td>${u.numero}</td><td>${u.morador?.nome||u.morador}</td><td>${u.pagamentos?.length||0}</td></tr>`;
    });
  }catch(e){t.innerHTML=`<tr><td colspan=3>Erro: ${e.message}</td></tr>`;}
}

/* INIT */
async function init(){
  await fetchResumo(); await fetchEvolucao(); await listarReceitas(); await listarUnidades();
}
document.getElementById("btnRefresh").onclick=init;
init();
