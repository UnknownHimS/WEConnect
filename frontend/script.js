const API_URL = 'https://weconnectb.onrender.com/api/users'; // Backend API for users

// Selecting the forms
const userForm = document.getElementById('user-form');
const loginForm = document.getElementById('login-form');

// Fetch and display users
async function fetchUsers() {
  try {
    const res = await fetch(API_URL);
    const users = await res.json();
    const usersList = document.getElementById('users');
    usersList.innerHTML = users.map(u => `<li>${u.name}</li>`).join('');
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
}

// Handle Add User form submission
userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('name');
  const name = nameInput.value.trim();
  if (!name) return;

  try {
    // Sending a POST request to add the user
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    nameInput.value = ''; // Clear input field after submitting
    fetchUsers(); // Refresh the user list
  } catch (error) {
    alert('Error adding user');
    console.error('Error adding user:', error);
  }
});

// Handle Login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const passwordInput = document.getElementById('password');
  const password = passwordInput.value.trim();

  if (!password) return;

  try {
    const res = await fetch('https://weconnectb.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = 'mceo-dashboard.html'; // Redirect to dashboard after login
    } else {
      alert('Login failed. Please try again.');
    }
  } catch (error) {
    alert('Error logging in');
    console.error('Login error:', error);
  }
});

// Initial load of users
fetchUsers();
