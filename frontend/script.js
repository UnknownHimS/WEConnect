document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('user-form');
  const userList = document.getElementById('users');
  const loadingMessage = document.getElementById('loading-message'); // A new element to display loading state

  const loadUsers = async () => {
    loadingMessage.textContent = 'Loading users...'; // Show loading message
    try {
      const res = await fetch('https://weconnectb.onrender.com/api/users');
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await res.json();
      userList.innerHTML = '';
      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name;
        userList.appendChild(li);
      });
      loadingMessage.textContent = ''; // Clear loading message
    } catch (error) {
      loadingMessage.textContent = `Error: ${error.message}`; // Show error message
    }
  };

  form.addEventListener('submit', async (e) => {
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
      loadUsers();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });

  loadUsers();
});

