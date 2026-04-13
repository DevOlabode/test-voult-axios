async function startGoogleOAuth(intent) {
    try {
      const response = await fetch('/google/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ intent })
      });
  
      const data = await response.json();
      if (!response.ok || !data.authUrl) {
        throw new Error(data.message || 'Failed to start Google OAuth');
      }
  
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Google OAuth start failed:', error.message);
      alert(error.message);
    }
  }
  
  function renderGoogleButton(targetId, intent, label) {
    const container = document.getElementById(targetId);
    if (!container) return;
  
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-google-oauth';
    button.textContent = label;
    button.addEventListener('click', () => startGoogleOAuth(intent));
    container.replaceChildren(button);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    renderGoogleButton('google-login-btn', 'login', 'Sign in with Google');
    renderGoogleButton('google-register-btn', 'register', 'Sign up with Google');
  });  