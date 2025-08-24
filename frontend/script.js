const API_URL = 'https://weconnectb.onrender.com';  // Replace with your backend URL once deployed

// Handle adding a visitor
document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  if (!name) return;

  const res = await fetch(`${API_URL}/api/visitor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  const data = await res.json();
  alert(data.message);  // Show success/error message
  document.getElementById('name').value = '';  // Clear the input field
});

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) return;

  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Login successful! Redirecting...');
    window.location.href = data.redirectUrl;  // Redirect based on role
  } else {
    alert(data.message);  // Show login error message
  }
});

