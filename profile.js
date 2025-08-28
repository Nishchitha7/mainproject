// profile.js
window.onload = async function() {
    try {
        const res = await fetch('http://localhost:3000/api/profile', {
            credentials: 'include'
        });
        const result = await res.json();
        if (result.success && result.user) {
            const user = result.user;
            document.getElementById('profile-name').textContent = user.fullName || '';
            document.getElementById('profile-username').textContent = user.username || '';
            document.getElementById('profile-email').textContent = user.email || '';
            document.getElementById('profile-phone').textContent = user.phone || '';
            document.getElementById('profile-type').textContent = user.usertype || '';
            document.getElementById('profile-location').textContent = user.location || '';
            document.getElementById('profile-careergoal').textContent = user.careerGoal || '';
            document.getElementById('profile-technologies').textContent = (user.preferredTechnologies || []).join(', ');
        } else {
            document.querySelector('.profile-container').innerHTML = '<p>User data not found. Please login again.</p>';
        }
    } catch (error) {
        document.querySelector('.profile-container').innerHTML = '<p>Error fetching user data. Please login again.</p>';
    }
};
