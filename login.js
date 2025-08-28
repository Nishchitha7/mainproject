document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  
  const data = {
    email: form.email.value,
    password: form.password.value
  };
  
  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const result = await res.json();
      if (result.success) {
        // Store user data in localStorage for profile page
        if (result.user) {
          localStorage.setItem('profileUser', JSON.stringify(result.user));
        }
        window.location.href = 'index.html';
      } else {
        alert(result.message);
      }
  } catch (error) {
    alert('Error connecting to server. Please try again.');
  }
}); 