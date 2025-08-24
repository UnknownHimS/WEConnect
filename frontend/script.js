const API_URL = 'https://weconnectb.onrender.com'; // Replace after deploy!

const userForm = document.getElementById('user-form');
const usersList = document.getElementById('users');

async function fetchUsers() {
  const res = await fetch(API_URL);
  const users = await res.json();
  usersList.innerHTML = users.map(u => `<li>${u.name}</li>`).join('');
}

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('name');
  const name = nameInput.value.trim();
  if (!name) return;

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  nameInput.value = '';
  fetchUsers();
});

// Load users on page load
fetchUsers();

