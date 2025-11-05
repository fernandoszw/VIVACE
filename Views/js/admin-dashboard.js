import { ref, onValue, db } from "../../config/db.js";

document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    const roleLogado = localStorage.getItem("roleLogado");

    if (!usuarioLogado || roleLogado !== "admin") {
        alert("Acesso restrito a administradores!");
        window.location.href = "../index.html";
        return;
    }

    const navLinks = document.querySelectorAll("nav a");
    const sections = document.querySelectorAll(".content-section");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            sections.forEach(s => s.classList.remove("active"));
            document.getElementById(link.dataset.section).classList.add("active");
        });
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("roleLogado");
        window.location.href = "../index.html";
    });

    const listaMoradores = document.getElementById("listaMoradores");
    const listaVeiculos = document.getElementById("listaVeiculos");
    const listaAnimais = document.getElementById("listaAnimais");

    onValue(ref(db, "users"), (snapshot) => {
        if (!snapshot.exists()) return;

        listaMoradores.innerHTML = "";
        listaVeiculos.innerHTML = "";
        listaAnimais.innerHTML = "";

        snapshot.forEach(userSnap => {
            const userKey = userSnap.key;
            const userData = userSnap.val();
            const dados = userData.dados || {};
            const carros = userData.carros || {};
            const animais = userData.animais || {};

            // --- Moradores ---
            listaMoradores.innerHTML += `
        <div class="item-card">
          <strong>${dados.nome || userData.email}</strong><br>
          <small>${dados.bloco ? `Bloco ${dados.bloco}, Ap ${dados.apartamento}` : "Dados não informados"}</small><br>
          <small>Email: ${userData.email}</small>
        </div>
      `;

            // --- Veículos ---
            Object.values(carros).forEach(v => {
                listaVeiculos.innerHTML += `
          <div class="item-card">
            <strong>${v.modelo}</strong> - ${v.placa} (${v.cor})
            <br><small>Dono: ${dados.nome || userData.email}</small>
          </div>
        `;
            });

            // --- Animais ---
            Object.values(animais).forEach(a => {
                listaAnimais.innerHTML += `
          <div class="item-card">
            <strong>${a.nome}</strong> - ${a.especie} (${a.raca || "Sem raça"})
            <br><small>Dono: ${dados.nome || userData.email}</small>
          </div>
        `;
            });
        });
    });
});
