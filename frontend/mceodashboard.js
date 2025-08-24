document.addEventListener('DOMContentLoaded', () => {
  const userList = document.getElementById('users');
  const loadingMessage = document.getElementById('loading-message');

  const loadUsers = async () => {
    loadingMessage.textContent = 'Loading users...';
    try {
      const res = await fetch('https://weconnectb.onrender.com/api/users');
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await res.json();
      userList.innerHTML = ''; // Clear existing user list

      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name;
        userList.appendChild(li);
      });

      loadingMessage.textContent = ''; // Clear loading message
    } catch (error) {
      loadingMessage.textContent = `Error: ${error.message}`;
    }
  };

  loadUsers(); // Load users as soon as the dashboard page is loaded
});
