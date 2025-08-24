// Visitor Name Form Submission
const visitorForm = document.getElementById('visitor-form');
const visitorNameInput = document.getElementById('visitor-name');

// Login Form Submission
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const loginPasswordInput = document.getElementById('login-password');

// Function to handle visitor name submission
visitorForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const visitorName = visitorNameInput.value.trim();
  
  if (!visitorName) return alert('Please enter a valid name.');

  try {
    const response = await fetch('https://weconnectb.onrender.com/api/visitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: visitorName }),
    });
    
    if (response.ok) {
      alert('Your name has been added!');
    } else {
      alert('Error adding name.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error adding name.');
  }
});

// Function to handle staff login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = usernameInput.value.trim();
  const password = loginPasswordInput.value.trim();
  
  if (!username || !password) return alert('Please enter both username and password.');

  try {
    const response = await fetch('https://weconnectb.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    
    if (response.ok) {
      alert('Login successful!');
      // Redirect to the appropriate dashboard after successful login
      window.location.href = result.redirectUrl;
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Login failed.');
  }
});
