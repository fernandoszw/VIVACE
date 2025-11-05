
import { ref, get, child } from "../../config/db.js";
import emailjs from "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";
emailjs.init("F6rYIXtr5aEORGa6D");

const emailInput = document.getElementById("email-reset");
const sendBtn = document.getElementById("send-reset");
const msg = document.getElementById("message-reset");

function setMessage(text, isError = true) {
    msg.textContent = text;
    msg.style.color = isError ? "#b00020" : "#1DB954";
}

sendBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return setMessage("Digite seu e-mail.");

    const userKey = email.replace(/\./g, "_");
    sendBtn.disabled = true;

    try {
        const snapshot = await get(child(ref(db), `users/${userKey}`));
        if (!snapshot.exists()) {
            return setMessage("Usuário não encontrado.");
        }
        const reset_link = `https://seusite.com/nova-senha.html?email=${encodeURIComponent(email)}`;
        await emailjs.send("service_at554lp", "template_w7oxnfj", {
            to_email: email,
            reset_link: reset_link,
        });
        setMessage("Link de redefinição enviado para seu e-mail!", false);
    } catch (err) {
        console.error(err);
        setMessage("Erro ao enviar e-mail. Veja o console.");
    } finally {
        sendBtn.disabled = false;
    }
});