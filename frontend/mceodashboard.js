const API_URL = 'https://weconnectb.onrender.com/api/users'; // Backend API for users

// Selecting the list element where users will be displayed
const usersList = document.getElementById('users');

// Fetch and display users
async function fetchUsers() {
  try {
    const res = await fetch(API_URL);
    const users = await res.json();
    usersList.innerHTML = users.map(u => `<li>${u.name}</li>`).join('');
  } catch (error) {
    console.error('Failed to fetch users:', error);
    usersList.innerHTML = '<li>Failed to load users.</li>';
  }
}

// Load users on page load
fetchUsers();
