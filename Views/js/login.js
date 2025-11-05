import { get, ref, set, child, push, onValue, db } from "../../config/db.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupBtn = document.getElementById("signup-btn");
  const loginBtn = document.getElementById("login-btn");
  const messageDiv = document.getElementById("message");

  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const roleLogado = localStorage.getItem("roleLogado");

  const userKey = usuarioLogado ? usuarioLogado.replace(/\./g, "_") : null;

  function setMessage(text, isError = true) {
    if (messageDiv) {
      messageDiv.textContent = text;
      messageDiv.style.color = isError ? "#b00020" : "#007700";
    } else {
      alert(text);
    }
  }

  function toggleButtons(disabled = true) {
    if (loginBtn) loginBtn.disabled = disabled;
    if (signupBtn) signupBtn.disabled = disabled;
  }

  // Redirecionamento automático se já estiver logado
  if (usuarioLogado && roleLogado) {
    if (roleLogado === "admin") {
      window.location.href = "./html/admin-dashboard.html";
    } else {
      window.location.href = "./html/dashboard.html";
    }
  }

  // ====== SIGNUP ======
  if (loginForm && signupBtn && loginBtn) {
    signupBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      if (!email || !password) return setMessage("Preencha email e senha.");
      if (password.length < 6)
        return setMessage("Senha precisa ter ao menos 6 caracteres.");

      const newUserKey = email.replace(/\./g, "_");

      try {
        toggleButtons(true);
        const snapshot = await get(child(ref(db), `users/${newUserKey}`));

        if (snapshot.exists()) {
          return setMessage("Usuário já cadastrado. Faça login.");
        }

        // Detectar se é admin pelo domínio do e-mail
        const isAdmin = email.endsWith("@admin.com");
        const role = isAdmin ? "admin" : "user";

        await set(ref(db, `users/${newUserKey}`), {
          email,
          password,
          role,
          createdAt: new Date().toISOString(),
        });

        localStorage.setItem("usuarioLogado", email);
        localStorage.setItem("roleLogado", role);

        setMessage("Cadastro realizado com sucesso!", false);
        setTimeout(() => {
          if (role === "admin") {
            window.location.href = "./html/admin-dashboard.html";
          } else {
            window.location.href = "./html/dashboard.html";
          }
        }, 1000);
      } catch (err) {
        console.error(err);
        setMessage("Erro ao cadastrar. Veja o console.");
      } finally {
        toggleButtons(false);
      }
    });

    // ====== LOGIN ======
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      if (!email || !password) return setMessage("Preencha email e senha.");
      const loginKey = email.replace(/\./g, "_");

      try {
        toggleButtons(true);
        const snapshot = await get(child(ref(db), `users/${loginKey}`));

        if (!snapshot.exists()) {
          return setMessage("Usuário não encontrado. Cadastre-se.");
        }

        const userData = snapshot.val();
        if (userData.password !== password) {
          return setMessage("Senha incorreta.");
        }

        // Detecta admin pelo e-mail/senha fixos
        const isAdmin = email === "admin@admin.com" && password === "admin123";
        const role = isAdmin ? "admin" : userData.role || "user";

        localStorage.setItem("usuarioLogado", email);
        localStorage.setItem("roleLogado", role);

        setMessage("Login realizado com sucesso!", false);
        setTimeout(() => {
          if (role === "admin") {
            window.location.href = "./html/admin-dashboard.html";
          } else {
            window.location.href = "./html/dashboard.html";
          }
        }, 1000);
      } catch (err) {
        console.error(err);
        setMessage("Erro ao fazer login. Veja o console.");
      } finally {
        toggleButtons(false);
      }
    });
  }

  // ====== DASHBOARD DE USUÁRIO NORMAL ======
  if (usuarioLogado && roleLogado === "user" && document.getElementById("moradorForm")) {
    const navLinks = document.querySelectorAll("nav a");
    const sections = document.querySelectorAll(".content-section");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        sections.forEach((s) => s.classList.remove("active"));
        document.getElementById(link.dataset.section).classList.add("active");
      });
    });

    const moradorForm = document.getElementById("moradorForm");
    moradorForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dados = {
        nome: nome.value,
        bloco: bloco.value,
        apartamento: apartamento.value,
        telefone: telefone.value,
        email: email.value,
      };
      await set(ref(db, `users/${userKey}/dados`), dados);
      alert("✅ Dados do morador salvos com sucesso!");
    });

    const listaCarros = document.getElementById("listaCarros");
    const carroForm = document.getElementById("carroForm");
    carroForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const carro = {
        modelo: modelo.value,
        placa: placa.value,
        cor: cor.value,
        createdAt: new Date().toISOString(),
      };
      await push(ref(db, `users/${userKey}/carros`), carro);
      carroForm.reset();
    });

    onValue(ref(db, `users/${userKey}/carros`), (snap) => {
      listaCarros.innerHTML = "";
      if (snap.exists())
        snap.forEach((c) => {
          const v = c.val();
          listaCarros.innerHTML += `<div class='item-card'><strong>${v.modelo}</strong> - ${v.placa} (${v.cor})</div>`;
        });
    });

    const listaAnimais = document.getElementById("listaAnimais");
    const animalForm = document.getElementById("animalForm");
    animalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const animal = {
        nome: nomeAnimal.value,
        especie: especie.value,
        raca: raca.value,
        createdAt: new Date().toISOString(),
      };
      await push(ref(db, `users/${userKey}/animais`), animal);
      animalForm.reset();
    });

    onValue(ref(db, `users/${userKey}/animais`), (snap) => {
      listaAnimais.innerHTML = "";
      if (snap.exists())
        snap.forEach((a) => {
          const v = a.val();
          listaAnimais.innerHTML += `<div class='item-card'><strong>${v.nome}</strong> - ${v.especie} (${v.raca || "Sem raça"})</div>`;
        });
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      localStorage.removeItem("roleLogado");
      window.location.href = "../index.html";
    });
  }
});

localStorage.clear();
