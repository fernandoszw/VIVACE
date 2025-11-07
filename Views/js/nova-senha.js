import { ref, update, db } from "../../config/db.js";

const params = new URLSearchParams(window.location.search);
const email = params.get("email");
const userKey = email.replace(/\./g, "_");

const novaSenha = document.getElementById("novaSenha");
const confirmarSenha = document.getElementById("confirmarSenha");
const salvarBtn = document.getElementById("salvarBtn");
const msg = document.getElementById("message-reset");

function setMessage(text, isError = true) {
    msg.textContent = text;
    msg.style.color = isError ? "#b00020" : "#1DB954";
}

salvarBtn.addEventListener("click", async () => {
    const senha1 = novaSenha.value.trim();
    const senha2 = confirmarSenha.value.trim();

    if (!senha1 || !senha2) return setMessage("Preencha os dois campos.");
    if (senha1 !== senha2) return setMessage("As senhas não coincidem.");
    if (senha1.length < 6) return setMessage("A senha deve ter pelo menos 6 caracteres.");

    try {
        await update(ref(db, `users/${userKey}`), {
            password: senha1,
            updatedAt: new Date().toISOString(),
        });
        setMessage("Senha alterada com sucesso!", false);
        setTimeout(() => window.location.href = "../index.html", 1500);
    } catch (err) {
        console.error(err);
        setMessage("Erro ao alterar senha. Veja o console.");
    }
});