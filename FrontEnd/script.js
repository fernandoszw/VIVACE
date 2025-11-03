const apiUrl = 'http://localhost:5202/api/dashboard';
let dadosMensais = [];
let despesasMensais = [];

// Adicionar despesa
async function adicionarDespesa() {
  const mesAtual = dadosMensais[dadosMensais.length - 1];
  if (!mesAtual) return alert("Adicione um mês primeiro!");

  const nome = document.getElementById("nomeDespesaInput").value.trim();
  const valor = parseFloat(document.getElementById("valorDespesaInput").value);
  if (!nome || isNaN(valor)) return alert("Preencha corretamente!");

  const despesa = { nome, valor };

  try {
    const res = await fetch(`${apiUrl}/adicionar-despesa?mes=${mesAtual.mes}&ano=${mesAtual.ano}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(despesa)
    });
    if (!res.ok) throw new Error('Erro ao adicionar despesa');

    despesasMensais.push(despesa);
    atualizarGraficoDespesas();

    document.getElementById("nomeDespesaInput").value = "";
    document.getElementById("valorDespesaInput").value = "";
  } catch (err) {
    console.error(err);
    alert('Erro ao adicionar despesa');
  }
}

// Adicionar mês
async function adicionarMes() {
  const mes = document.getElementById("mesInput").value;
  const ano = parseInt(document.getElementById("anoInput").value);
  const receita = parseFloat(document.getElementById("receitaInput").value);
  const despesa = parseFloat(document.getElementById("despesaInput").value);
  const taxa = parseFloat(document.getElementById("taxaInput").value);

  if (!mes || isNaN(ano) || isNaN(receita) || isNaN(despesa) || isNaN(taxa)) {
    return alert("Preencha todos os campos corretamente!");
  }

  const novoMes = { mes, ano, receita, despesa, taxa, despesas: [...despesasMensais] };

  try {
    const res = await fetch(`${apiUrl}/adicionar-mes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoMes)
    });
    if (!res.ok) throw new Error('Erro ao adicionar mês');

    const data = await res.json();
    dadosMensais.push(data);
    despesasMensais = [];

    atualizarGraficos();
    atualizarTabela();
    atualizarIndicadores();
    atualizarGraficoDespesas();
  } catch (err) {
    console.error(err);
    alert('Erro ao adicionar mês');
  }
}

// Remover mês
async function removerMes(index) {
  const mes = dadosMensais[index];
  try {
    const res = await fetch(`${apiUrl}/remover-mes?mes=${mes.mes}&ano=${mes.ano}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover mês');

    dadosMensais.splice(index, 1);
    atualizarGraficos();
    atualizarTabela();
    atualizarIndicadores();
    atualizarGraficoDespesas();
  } catch (err) {
    console.error(err);
    alert('Erro ao remover mês');
  }
}
