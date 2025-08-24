document.addEventListener('DOMContentLoaded', () => {
  const userForm = document.getElementById('user-form');
  const loginForm = document.getElementById('login-form');
  const loadingMessage = document.getElementById('loading-message');
  
  // Handle Add User form submission
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;

    if (!name) return;

    try {
      const res = await fetch('https://weconnectb.onrender.com/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error('Failed to add user');
      }

      document.getElementById('name').value = '';
      alert('User added successfully');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

  // Handle Login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    if (!password) return;

    try {
      const res = await fetch('https://weconnectb.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error('Failed to login');
      }

      // Redirect to CEO Dashboard after login
      window.location.href = 'mceo-dashboard.html'; // Redirect to dashboard
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
});
