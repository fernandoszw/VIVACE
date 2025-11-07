import { ref, set, push, onValue, db } from "../../config/db.js";

document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  if (!usuarioLogado) window.location.href = "../index.html";

  const userKey = usuarioLogado.replace(/\./g, "_");

  // Navegação de seções
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

  // ====== FORMULÁRIO DE MORADOR ======
  const moradorForm = document.getElementById("moradorForm");
  moradorForm.addEventListener("submit", async e => {
    e.preventDefault();
    const dados = {
      nome: nome.value,
      bloco: bloco.value,
      apartamento: apartamento.value,
      telefone: telefone.value,
      email: email.value,
      updatedAt: new Date().toISOString()
    };

    // Salva os dados no nó de usuários
    await set(ref(db, `usuarios/${userKey}/dados`), dados);

    alert("✅ Dados do morador salvos com sucesso!");
  });

  // ====== FORMULÁRIO DE CARROS ======
  const listaCarros = document.getElementById("listaCarros");
  const carroForm = document.getElementById("carroForm");

  carroForm.addEventListener("submit", async e => {
    e.preventDefault();
    const carro = {
      modelo: modelo.value,
      placa: placa.value,
      cor: cor.value,
      donoId: userKey, // 🔗 referência ao usuário dono
      createdAt: new Date().toISOString()
    };

    // Salva o carro tanto na tabela global quanto no usuário
    const novoCarroRef = push(ref(db, `carros`));
    await set(novoCarroRef, carro);

    // Também salva o id dentro do usuário
    await push(ref(db, `usuarios/${userKey}/carros`), { id: novoCarroRef.key });

    carroForm.reset();
  });

  // Exibe carros do usuário
  onValue(ref(db, `carros`), snap => {
    listaCarros.innerHTML = "";
    if (snap.exists()) {
      snap.forEach(c => {
        const v = c.val();
        if (v.donoId === userKey) {
          listaCarros.innerHTML += `<div class='item-card'><strong>${v.modelo}</strong> - ${v.placa} (${v.cor})</div>`;
        }
      });
    }
  });

  // ====== FORMULÁRIO DE ANIMAIS ======
  const listaAnimais = document.getElementById("listaAnimais");
  const animalForm = document.getElementById("animalForm");

  animalForm.addEventListener("submit", async e => {
    e.preventDefault();
    const animal = {
      nome: nomeAnimal.value,
      especie: especie.value,
      raca: raca.value,
      donoId: userKey, // 🔗 referência ao usuário dono
      createdAt: new Date().toISOString()
    };

    // Salva o animal tanto na tabela global quanto no usuário
    const novoAnimalRef = push(ref(db, `animais`));
    await set(novoAnimalRef, animal);

    // Também salva o id dentro do usuário
    await push(ref(db, `usuarios/${userKey}/animais`), { id: novoAnimalRef.key });

    animalForm.reset();
  });

  // Exibe animais do usuário
  onValue(ref(db, `animais`), snap => {
    listaAnimais.innerHTML = "";
    if (snap.exists()) {
      snap.forEach(a => {
        const v = a.val();
        if (v.donoId === userKey) {
          listaAnimais.innerHTML += `<div class='item-card'><strong>${v.nome}</strong> - ${v.especie} (${v.raca || "Sem raça"})</div>`;
        }
      });
    }
  });

  // ====== LOGOUT ======
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "../index.html";
  });
});