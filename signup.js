document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  
  // Get selected technologies
  const technologySelect = form.preferredTechnologies;
  const selectedTechnologies = [];
  for (let i = 0; i < technologySelect.options.length; i++) {
    if (technologySelect.options[i].selected) {
      selectedTechnologies.push(technologySelect.options[i].value);
    }
  }
  
  const data = {
    username: form.username.value,
    fullName: form.fullName.value,
    usertype: form.usertype.value,
    phone: form.phone.value || '',
    email: form.email.value,
    password: form.password.value,
    location: form.location.value,
    careerGoal: form.careerGoal.value,
    preferredTechnologies: selectedTechnologies
  };
  
  const res = await fetch('http://localhost:3000/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (result.success) {
    window.location.href = 'index.html';
  } else {
    alert(result.message);
  }
}); 