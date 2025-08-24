document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('user-form');
  const userList = document.getElementById('users');

  const loadUsers = async () => {
    const res = await fetch('/api/users');
    const users = await res.json();
    userList.innerHTML = '';
    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      userList.appendChild(li);
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;

    if (!name) return;

    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    document.getElementById('name').value = '';
    loadUsers();
  });

  loadUsers();
});
