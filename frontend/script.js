const API_URL = `https://weconnectb.onrender.com`; // Correct URL for your backend

const loginForm = document.getElementById('login-form');

// Handle Login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) return;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const error = await res.text();
      alert(error); // Display error message
      return;
    }

    const { token, redirectUrl } = await res.json();

    // Store JWT token in localStorage
    localStorage.setItem('token', token);

    // Redirect to the appropriate dashboard based on the user role
    window.location.href = redirectUrl;
  } catch (error) {
    alert('Error logging in');
    console.error('Login error:', error);
  }
});
