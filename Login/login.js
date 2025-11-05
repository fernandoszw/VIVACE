import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// 🔥 Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFXZblMDJqjNdw84x0EOtUDQ6CUrTk9B8",
  authDomain: "loginvivace.firebaseapp.com",
  databaseURL: "https://loginvivace-default-rtdb.firebaseio.com",
  projectId: "loginvivace",
  storageBucket: "loginvivace.firebasestorage.app",
  messagingSenderId: "900481651159",
  appId: "1:900481651159:web:b47dcbbcd68d023e8afb92"
};

// Inicializa o app e o banco
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupBtn = document.getElementById("signup-btn");
  const loginBtn = document.getElementById("login-btn");
  const messageDiv = document.getElementById("message");

  function setMessage(text, isError = true) {
    messageDiv.textContent = text;
    messageDiv.style.color = isError ? "#b00020" : "#007700";
  }

  function toggleButtons(disabled = true) {
    loginBtn.disabled = disabled;
    signupBtn.disabled = disabled;
  }

  // 🟢 Cadastro
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return setMessage("Preencha email e senha.");
    if (password.length < 6) return setMessage("Senha precisa ter ao menos 6 caracteres.");

    const userKey = email.replace(/\./g, "_");

    try {
      toggleButtons(true);
      const snapshot = await get(child(ref(db), `users/${userKey}`));

      if (snapshot.exists()) {
        return setMessage("Usuário já cadastrado. Faça login.");
      }

      await set(ref(db, `users/${userKey}`), {
        email,
        password,
        createdAt: new Date().toISOString()
      });

      setMessage("Cadastro realizado com sucesso!", false);

      // 🔄 redireciona corretamente para /Login/Cadastro/index.html
      setTimeout(() => (window.location.href = "Cadastro/index.html"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao cadastrar. Veja o console.");
    } finally {
      toggleButtons(false);
    }
  });

  // 🔵 Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) return setMessage("Preencha email e senha.");

    const userKey = email.replace(/\./g, "_");

    try {
      toggleButtons(true);
      const snapshot = await get(child(ref(db), `users/${userKey}`));

      if (!snapshot.exists()) {
        return setMessage("Usuário não encontrado. Cadastre-se.");
      }

      const userData = snapshot.val();

      if (userData.password !== password) {
        return setMessage("Senha incorreta.");
      }

      localStorage.setItem("usuarioLogado", email);
      setMessage("Login realizado com sucesso!", false);

      // 🔄 Redireciona corretamente
      setTimeout(() => (window.location.href = "Cadastro/index.html"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao fazer login. Veja o console.");
    } finally {
      toggleButtons(false);
    }
  });
});
