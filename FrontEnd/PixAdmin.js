// client-side PIX QR generator (EMV) + calls to backend endpoints (optional)
const apiUrl = "http://localhost:5202/api/pix";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnLoadKeys").addEventListener("click", loadKeys);
  document.getElementById("btnAddKey").addEventListener("click", toggleNewKeyForm);
  document.getElementById("saveKeyBtn").addEventListener("click", saveKey);
  document.getElementById("generateClientBtn").addEventListener("click", generateClientQr);
  document.getElementById("generateServerBtn").addEventListener("click", generateServerQr);
  document.getElementById("downloadQrBtn").addEventListener("click", downloadCanvasAsPng);

  loadKeys(); // load existing keys on open
});

async function loadKeys() {
  try {
    const res = await fetch(`${apiUrl}/keys`);
    if (!res.ok) throw new Error("Erro ao buscar chaves");
    const keys = await res.json();
    const sel = document.getElementById("pixKeySelect");
    sel.innerHTML = '<option value="">— Usar chave cadastrada —</option>';
    keys.forEach(k => {
      const opt = document.createElement("option");
      opt.value = k.id;
      opt.textContent = `${k.tipo} — ${k.valor} (${k.nome || '-'})`;
      opt.dataset.tipo = k.tipo;
      opt.dataset.valor = k.valor;
      opt.dataset.nome = k.nome;
      opt.dataset.cidade = k.cidade;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar chaves: " + err.message);
  }
}

function toggleNewKeyForm() {
  const f = document.getElementById("newKeyForm");
  f.classList.toggle("hidden");
}

async function saveKey() {
  const tipo = document.getElementById("chaveTipo").value.trim();
  const valor = document.getElementById("chaveValor").value.trim();
  const nome = document.getElementById("chaveNome").value.trim();
  const cidade = document.getElementById("chaveCidade").value.trim();

  if (!tipo || !valor) return alert("Preencha tipo e valor da chave");

  const payload = { tipo, valor, nome, cidade };
  try {
    const res = await fetch(`${apiUrl}/register`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(()=>({message:"Erro"}));
      throw new Error(err.message || "Erro ao salvar chave");
    }
    alert("Chave salva");
    document.getElementById("newKeyForm").classList.add("hidden");
    loadKeys();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// ---------- CLIENT-SIDE QR GENERATION ----------
async function generateClientQr() {
  // pick key (from select) or prompt for raw key
  const sel = document.getElementById("pixKeySelect");
  let chave, nome, cidade;
  if (sel.value) {
    const opt = sel.selectedOptions[0];
    chave = opt.dataset.valor;
    nome = opt.dataset.nome || "";
    cidade = opt.dataset.cidade || "";
  } else {
    chave = prompt("Informe a chave PIX (ex: seu@email.com, 11999990000, CPF, ou aleatória):");
    if (!chave) return;
    nome = prompt("Nome do recebedor (opcional):") || "";
    cidade = prompt("Cidade do recebedor (opcional):") || "";
  }

  const amountRaw = document.getElementById("amount").value;
  const amount = amountRaw ? parseFloat(amountRaw).toFixed(2) : null;
  const txid = document.getElementById("txid").value || "***";
  const desc = document.getElementById("description").value || "";

  const payload = buildPixPayload({
    chave,
    nome,
    cidade,
    amount,
    txid,
    descricao: desc
  });

  // show payload
  document.getElementById("payloadArea").textContent = payload;

  // draw QR on canvas using qrcode lib
  const canvas = document.getElementById("qrCanvas");
  canvas.width = 320;
  canvas.height = 320;
  // qrcode lib supports toCanvas
  QRCode.toCanvas(canvas, payload, { width: 320 }, function (err) {
    if (err) {
      console.error(err);
      alert("Erro ao gerar QR no cliente");
    } else {
      document.getElementById("downloadQrBtn").style.display = "inline-block";
      document.getElementById("qrImageServer").style.display = "none";
    }
  });
}

// ---------- SERVER-SIDE QR (PNG base64) ----------
async function generateServerQr() {
  const sel = document.getElementById("pixKeySelect");
  let keyId = sel.value;
  let amount = document.getElementById("amount").value || "";
  let txid = document.getElementById("txid").value || "";
  let desc = document.getElementById("description").value || "";

  if (!keyId) {
    // if no key selected, ask for key text
    const chave = prompt("Informe a chave PIX (ex: seu@email.com, 11999990000, CPF, ou aleatória):");
    if (!chave) return alert("É necessário informar a chave ou cadastrar uma.");
    // we call backend payload endpoint with chave via query param 'rawKey'
    keyId = null;
    try {
      const qs = new URLSearchParams({ rawKey: chave, amount, txid, desc });
      const res = await fetch(`${apiUrl}/payload?${qs.toString()}`);
      if (!res.ok) throw new Error("Erro ao solicitar payload");
      const data = await res.json();
      showServerQr(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
    return;
  }

  try {
    const qs = new URLSearchParams({ keyId, amount, txid, desc });
    const res = await fetch(`${apiUrl}/payload?${qs.toString()}`);
    if (!res.ok) {
      const e = await res.json().catch(()=>({message:"Erro"}));
      throw new Error(e.message || "Erro");
    }
    const data = await res.json();
    showServerQr(data);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

function showServerQr(data){
  // data = { payload: "...", qrBase64: "data:image/png;base64,..." }
  document.getElementById("payloadArea").textContent = data.payload || "";
  const img = document.getElementById("qrImageServer");
  img.src = data.qrBase64;
  img.style.display = "block";
  document.getElementById("downloadQrBtn").style.display = "none";
  // clear canvas
  const canvas = document.getElementById("qrCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

function downloadCanvasAsPng(){
  const canvas = document.getElementById("qrCanvas");
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "pix_qr.png";
  a.click();
}

/* ================ helper: build PIX EMV payload (client-side version) ================
  This implementation builds a PIX payload EMV using common tags:
  - payload format indicator (00)
  - merchant account info GUI + chave (26)
  - merchant name (59) & city (60)
  - txid in 62.05 (or you can use 62 subfields)
  - amount (54) optional
  - description (optional via 26/25 or 58/...) — here we put in undata
  - CRC 16 at the end (tag 63)
  This is a simplified but widely used approach; for production, validate strings and tag rules.
*/
function tlv(id, value){
  const v = String(value ?? "");
  const len = v.length.toString().padStart(2,'0');
  return `${id}${len}${v}`;
}

function buildPixPayload({chave, nome, cidade, amount, txid, descricao}){
  // merchant account info (GUI + key)
  // Tag 26 subfields: 00 -> GUI ("br.gov.bcb.pix"), 01 -> chave
  const gui = tlv("00","br.gov.bcb.pix");
  const subChave = tlv("01", chave);
  const merchantAccountInfo = tlv("26", gui + subChave);

  // other fixed tags
  const payloadFormat = tlv("00","01");
  const merchantCategoryCode = tlv("52","0000");
  const transactionCurrency = tlv("53","986"); // BRL
  const amountTag = amount ? tlv("54", Number(amount).toFixed(2)) : "";
  const country = tlv("58","BR");

  const nameTag = nome ? tlv("59", nome.substring(0,25)) : tlv("59"," ");
  const cityTag = cidade ? tlv("60", cidade.substring(0,15)) : tlv("60"," ");

  // Additional Tx ID inside field 62 (additional data field)
  // we put TXID as subfield 05
  const txSub = tlv("05", txid || ""); // if empty, banks accept "000"
  const additional = tlv("62", txSub);

  // assemble without CRC (63)
  let raw = payloadFormat + merchantAccountInfo + merchantCategoryCode + transactionCurrency + amountTag + country + nameTag + cityTag + additional;

  // optional description could be appended in "26" custom or not — skipping for brevity

  // CRC16-CCITT (X25) compute for full string + "6304"
  const crc = crc16(raw + "6304");
  raw += "63" + "04" + crc.toUpperCase();
  return raw;
}

// CRC16-CCITT (X25) implementation
function crc16(input){
  // polynomial 0x1021 initial 0xFFFF reversed? using CRC-16/CCITT-FALSE common
  let crc = 0xFFFF;
  for (let i=0;i<input.length;i++){
    crc ^= input.charCodeAt(i) << 8;
    for (let j=0;j<8;j++){
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      else crc = (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).padStart(4,'0');
}
