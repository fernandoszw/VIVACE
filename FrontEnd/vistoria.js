function previewImagens(input, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    if (input.files) {
        [...input.files].forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                const img = document.createElement("img");
                img.src = e.target.result;
                container.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
}
document.getElementById("btnFinanceiro").addEventListener("click", () => {
    window.location.href = "./FinanceiroAdmin.html";
});

document.getElementById("fotosInicio").addEventListener("change", e => {
    previewImagens(e.target, "previewInicio");
});

document.getElementById("fotosFim").addEventListener("change", e => {
    previewImagens(e.target, "previewFim");
});

// Mostrar nome do arquivo de laudo
document.getElementById("arquivoLaudo").addEventListener("change", e => {
    const file = e.target.files[0];
    document.getElementById("nomeArquivo").textContent = file ? file.name : "Nenhum arquivo selecionado";
});

// Botão de salvar (simulação — pode conectar com backend depois)
document.getElementById("salvarVistoria").addEventListener("click", () => {
    alert("Vistoria salva com sucesso! (funcionalidade de backend pendente)");
});