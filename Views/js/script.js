const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('errorMessage');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if ((username === 'admin' && password === 'admin') ||
    (username === 'morador' && password === '123')) {
    alert(`Bem-vindo, ${username === 'admin' ? 'Administrador' : 'Morador'}!`);
    window.location.href = "dashboard.html"; // redireciona para outra página
  } else {
    errorDiv.style.display = 'block';
  }
});