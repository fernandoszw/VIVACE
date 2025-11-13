// Elementos do formulário
const form = document.getElementById('formPagamento');
const resultado = document.getElementById('resultado');
const qrImg = document.getElementById('qrcode');
const pixCopiaCola = document.getElementById('pixcopiacola');
const btnCopiar = document.getElementById('btnCopiar');
const btnPaguei = document.getElementById('btnPaguei');

// Preenche automaticamente se vier de Inadimplência
window.addEventListener('DOMContentLoaded', () => {
  const contaPendente = localStorage.getItem('contaPendente');
  if (contaPendente) {
    const { nome, valor } = JSON.parse(contaPendente);
    document.getElementById('nome').value = nome || '';
    document.getElementById('valor').value = valor || '';
    // limpa depois para não reaparecer na próxima vez
    localStorage.removeItem('contaPendente');
  }
});

// Evento de submissão
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  const descricao = document.getElementById('descricao').value.trim();

  if (!nome || valor <= 0) {
    alert("Preencha o nome da conta e um valor válido.");
    return;
  }

  try {
    // Chamada ao backend para gerar PIX
    const resp = await fetch('http://localhost:5202/api/pagamento/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        NomeConta: nome,
        Valor: valor,
        Descricao: descricao
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || 'Erro ao gerar PIX');
    }

    const data = await resp.json();

    // Exibe QR code real
    resultado.style.display = 'block';
    qrImg.src = `data:image/png;base64,${data.qrCodeBase64}`;
    pixCopiaCola.value = data.pixCopiaCola || data.PixCopiaCola || '';

    // Botão copiar Pix Copia e Cola
    btnCopiar.onclick = () => {
      navigator.clipboard.writeText(pixCopiaCola.value);
      alert('Código PIX copiado!');
    };

    // Botão confirmar pagamento
    btnPaguei.onclick = async () => {
      const respConfirm = await fetch(`http://localhost:5202/api/pagamento/confirmar/${data.txId}`, {
        method: 'PUT'
      });

      if (respConfirm.ok) {
        alert('Pagamento confirmado!');
        window.location.href = '../html/Historico.html';
      } else {
        const txt = await respConfirm.text();
        alert('Erro ao confirmar pagamento: ' + txt);
      }
    };

  } catch (err) {
    console.error(err);
    alert('Erro ao gerar pagamento: ' + (err.message || err));
  }
});
