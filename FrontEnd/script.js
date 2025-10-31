const API_BASE = localStorage.getItem('vivace_api') || 'http://localhost:5202/api';

// Funções utilitárias
function fmtMoney(val){ return 'R$ '+val.toFixed(2).replace('.',','); }

// CRC16 Pix
function crc16(payload) {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) != 0 ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Gerar QR Code Pix
function gerarPixQRCode(chavePix, nomeRecebedor, cidade, valor, txid='***'){
    const valorStr = valor.toFixed(2);
    const payload =
`00020126580014BR.GOV.BCB.PIX01${String(chavePix.length).padStart(2,'0')}${chavePix}520400005303986540${valorStr}5802BR5913${nomeRecebedor.padEnd(13,' ')}6009${cidade.padEnd(9,' ')}62070503${txid}6304`;
    const payloadFinal = payload + crc16(payload);

    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    new QRCode(qrContainer,{text:payloadFinal,width:200,height:200});

    document.getElementById("pixInfo").innerText =
`Chave Pix: ${chavePix}
Valor: R$ ${valorStr}
TXID: ${txid}`;

    document.getElementById("pixModal").style.display = "flex";
}

// Fechar modal
document.getElementById("closeModal").addEventListener("click",()=>{
    document.getElementById("pixModal").style.display="none";
});

// Listar Receitas
async function listarReceitas(){
    const tbody = document.querySelector('#tabelaReceitas tbody');
    try{
        const d = await fetch(`${API_BASE}/receitas`).then(r=>r.json());
        tbody.innerHTML = '';
        d.forEach(r=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${r.id}</td><td>${r.descricao}</td><td>${fmtMoney(r.valor)}</td><td>${r.data? new Date(r.data).toLocaleDateString():''}</td>`;
            tbody.appendChild(tr);

            // Clique para gerar QR Pix
            tr.addEventListener("click",()=>{
                const valorNum = r.valor;
                const txid = `TX${Date.now()}${Math.floor(Math.random()*1000)}`;
                gerarPixQRCode("seu-email@exemplo.com","Gabriel Muniz","Sao Paulo",valorNum,txid);
            });
        });
    }catch(e){
        tbody.innerHTML='<tr><td colspan="4">Não foi possível carregar. (API)</td></tr>';
    }
}

// Relatórios
document.getElementById('btnExportInadimplencia').addEventListener('click', async ()=>{
    try{
        const resp = await fetch(`${API_BASE}/relatorios/inadimplencia/excel`);
        if(!resp.ok) throw new Error(resp.status);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download='inadimplencia.xlsx'; a.click();
        URL.revokeObjectURL(url);
    }catch(e){ alert('Erro ao exportar: '+e.message);}
});

document.getElementById('btnGerarBalancete').addEventListener('click', async ()=>{
    const mes = new Date().getMonth()+1; const ano = new Date().getFullYear();
    try{
        const resp = await fetch(`${API_BASE}/relatorios/balancete?mes=${mes}&ano=${ano}`);
        if(!resp.ok) throw new Error(resp.status);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href=url; a.download=`balancete-${mes}-${ano}.pdf`; a.click();
        URL.revokeObjectURL(url);
    }catch(e){ alert('Erro ao gerar balancete: '+e.message);}
});

// Init
async function init(){
    await listarReceitas();
}
init();
