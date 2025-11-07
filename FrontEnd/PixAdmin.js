const apiUrl = "http://localhost:5202/api/pix";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnCriarPix").addEventListener("click", criarPix);
  document.getElementById("btnListarPix").addEventListener("click", listarPix);
});

async function criarPix() {
  const moradorId = document.getElementById("moradorId").value;
  const email = document.getElementById("email").value;
  const descricao = document.getElementById("descricao").value;
  const amount = document.getElementById("amount").value;

  if (!moradorId || !amount || !email) return alert("Preencha todos os campos.");

  const payload = { MoradorId: parseInt(moradorId), Amount: parseFloat(amount), Descricao: descricao, Email: email };

  try {
    const res = await fetch(`${apiUrl}/criar`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({message:"Erro ao criar PIX"}));
      throw new Error(err.message);
    }
    const data = await res.json();
    alert(`PIX criado! ID: ${data.id}`);

  } catch(err) {
    console.error(err);
    alert(err.message);
  }
}

async function listarPix() {
  const moradorId = document.getElementById("moradorIdList").value;
  if (!moradorId) return alert("Informe o ID do morador");

  try {
    const res = await fetch(`${apiUrl}/morador/${moradorId}`);
    if (!res.ok) {
      const e = await res.json().catch(()=>({message:"Erro ao listar PIX"}));
      throw new Error(e.message);
    }
    const pixList = await res.json();
    renderPixList(pixList);

  } catch(err) {
    console.error(err);
    alert(err.message);
  }
}

function renderPixList(pixList) {
  const container = document.getElementById("pixListContainer");
  container.innerHTML = "";

  if(pixList.length === 0){
    container.innerHTML = "<p>Nenhum PIX encontrado.</p>";
    return;
  }

  pixList.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <p><strong>ID:</strong> ${p.id}</p>
      <p><strong>Descrição:</strong> ${p.descricao}</p>
      <p><strong>Valor:</strong> R$ ${p.valor.toFixed(2)}</p>
      <p><strong>Pago:</strong> ${p.pago ? "Sim" : "Não"}</p>
      <img id="qrImg-${p.id}" style="max-width:200px;" />
      <button onclick="consultarStatus('${p.externalReference}')">Atualizar Status</button>
      <button onclick="baixarQr('${p.id}')">Baixar QR</button>
      <hr>
    `;
    container.appendChild(card);
    document.getElementById(`qrImg-${p.id}`).src = p.qrCodeBase64;
  });
}

async function consultarStatus(externalReference){
  try{
    const res = await fetch(`${apiUrl}/status/${externalReference}`);
    if(!res.ok){
      const e = await res.json().catch(()=>({message:"Erro ao consultar status"}));
      throw new Error(e.message);
    }
    const data = await res.json();
    alert(`Status PIX ID ${data.id}: ${data.status} - Pago: ${data.pago}`);
    listarPix();
  }catch(err){
    console.error(err);
    alert(err.message);
  }
}

function baixarQr(pixId){
  const img = document.getElementById(`qrImg-${pixId}`);
  if(!img) return;
  const a = document.createElement("a");
  a.href = img.src;
  a.download = `pix_${pixId}.png`;
  a.click();
}
