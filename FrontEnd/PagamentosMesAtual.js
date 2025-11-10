const bills = [
  { id:1, nome:"Condomínio - Outubro/2025", venc:"05/11/2025", valor:850.00, desc:"Condomínio - Outubro/2025", unit:"Apt 101" },
  { id:2, nome:"Água - Outubro/2025", venc:"10/11/2025", valor:85.50, desc:"Água - Outubro/2025", unit:"Apt 101" },
  { id:3, nome:"Energia Elétrica - Outubro/2025", venc:"12/11/2025", valor:245.80, desc:"Energia Elétrica - Outubro/2025", unit:"Apt 101" },
  { id:4, nome:"Gás - Outubro/2025", venc:"15/11/2025", valor:120.00, desc:"Gás - Outubro/2025", unit:"Apt 101" }
];

const billsWrap=document.getElementById("bills");
const totalAmountEl=document.getElementById("totalAmount");
const pixModal=document.getElementById("pixModal");
const modalClose=document.getElementById("modalClose");
const modalTitle=document.getElementById("modalTitle");
const modalValue=document.getElementById("modalValue");
const modalBenef=document.getElementById("modalBenef");
const modalUnit=document.getElementById("modalUnit");
const modalDesc=document.getElementById("modalDesc");
const modalPayload=document.getElementById("modalPayload");
const qrCanvas=document.getElementById("qrCanvas");
const pixKeySelect=document.getElementById("pixKeySelect");
const btnLoadKeys=document.getElementById("btnLoadKeys");
const btnUseManual=document.getElementById("btnUseManual");
const copyBtn=document.getElementById("copyBtn");
const downloadBtn=document.getElementById("downloadBtn");
const payAllBtn=document.getElementById("payAll");

function renderBills(){
  billsWrap.innerHTML="";
  let total=0;
  bills.forEach(b=>{
    const el=document.createElement("div");
    el.className="bill";
    el.innerHTML=`
      <div class="left"><div class="icon">🏠</div>
      <div class="info"><h4>${b.nome}</h4><p>Vencimento: ${b.venc}</p></div></div>
      <div class="right"><div class="amount">R$ ${b.valor.toFixed(2)}</div>
      <button class="pagar" data-id="${b.id}">💳 Pagar</button></div>`;
    billsWrap.appendChild(el);
    total+=b.valor;
  });
  totalAmountEl.textContent=`R$ ${total.toFixed(2)}`;
  document.querySelectorAll(".pagar").forEach(btn=>{
    btn.addEventListener("click",()=>openPixModal(Number(btn.dataset.id)));
  });
}

btnUseManual.addEventListener("click",()=>{
  const tipo=prompt("Tipo da chave (email/cpf/cel/aleatoria):");
  if(!tipo)return;
  const valor=prompt("Valor da chave PIX:");
  if(!valor)return;
  const nome=prompt("Nome do recebedor:")||"Vivace Condomínio";
  const cidade=prompt("Cidade:")||"SAO PAULO";
  const k={tipo,valor,nome,cidade};
  const opt=document.createElement("option");
  opt.value=JSON.stringify(k);
  opt.text=`${k.tipo} — ${k.valor} (${k.nome})`;
  opt.selected=true;
  pixKeySelect.appendChild(opt);
});

function openPixModal(id){
  const bill=bills.find(x=>x.id===id);
  const key=getSelectedKey();
  if(!bill)return alert("Fatura não encontrada.");
  if(!key)return alert("Selecione ou insira uma chave PIX primeiro.");
  const payload=buildPixPayload({
    chave:key.valor,
    nome:key.nome,
    cidade:key.cidade,
    amount:bill.valor,
    txid:`BILL${bill.id}`,
    descricao:bill.desc
  });
  fillModal(bill.nome,bill.valor,key.nome,bill.unit,bill.desc,payload);
}

payAllBtn.addEventListener("click",()=>{
  const key=getSelectedKey();
  if(!key)return alert("Selecione ou insira uma chave PIX primeiro.");
  const total=bills.reduce((sum,b)=>sum+b.valor,0);
  const payload=buildPixPayload({
    chave:key.valor,
    nome:key.nome,
    cidade:key.cidade,
    amount:total,
    txid:`ALL${Date.now()}`,
    descricao:"Pagamento total mês"
  });
  fillModal("Pagamento Total",total,key.nome,"Apt 101","Todas as pendências",payload);
});

function getSelectedKey(){return pixKeySelect.value?JSON.parse(pixKeySelect.value):null;}

function fillModal(title,valor,benef,unidade,desc,payload){
  modalTitle.innerText=title;
  modalValue.innerText=`R$ ${valor.toFixed(2)}`;
  modalBenef.innerText=benef;
  modalUnit.innerText=unidade;
  modalDesc.innerText=desc;
  modalPayload.value=payload;
  QRCode.toCanvas(qrCanvas,payload,{width:320,margin:1});
  pixModal.classList.remove("hidden");
}

copyBtn.addEventListener("click",()=>{modalPayload.select();document.execCommand("copy");alert("Código PIX copiado!");});
downloadBtn.addEventListener("click",()=>{const a=document.createElement("a");a.href=qrCanvas.toDataURL("image/png");a.download="pix.png";a.click();});
modalClose.addEventListener("click",()=>pixModal.classList.add("hidden"));
pixModal.addEventListener("click",e=>{if(e.target===pixModal)pixModal.classList.add("hidden");});

function tlv(id,value){const v=String(value??"");return id+v.length.toString().padStart(2,"0")+v;}
function buildPixPayload({chave,nome,cidade,amount,txid,descricao}){
  const nomeClean=normalize(nome).substring(0,25);
  const cidadeClean=normalize(cidade).substring(0,15);
  const gui=tlv("00","BR.GOV.BCB.PIX");
  const chaveTag=tlv("01",chave);
  const merchantAccount=tlv("26",gui+chaveTag);
  let p="";
  p+=tlv("00","01")+merchantAccount+tlv("52","0000")+tlv("53","986");
  if(amount)p+=tlv("54",Number(amount).toFixed(2));
  p+=tlv("58","BR")+tlv("59",nomeClean)+tlv("60",cidadeClean)+tlv("62",tlv("05",txid||""));
  const crc=crc16(p+"6304");
  return p+"6304"+crc.toUpperCase();
}
function normalize(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w\s.-]/g,"");}
function crc16(str){
  let crc=0xFFFF;const poly=0x1021;const data=new TextEncoder().encode(str);
  for(let b of data){crc^=(b<<8);for(let i=0;i<8;i++){crc=(crc&0x8000)?((crc<<1)^poly)&0xFFFF:(crc<<1)&0xFFFF;}}
  return crc.toString(16).padStart(4,"0");
}

renderBills();
