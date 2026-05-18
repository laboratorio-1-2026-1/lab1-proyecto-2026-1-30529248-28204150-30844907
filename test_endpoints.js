(async () => {
  const base = 'http://localhost:3000';
  try {
    // login
    const loginRes = await fetch(`${base}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@smartgym.com', password: 'admin123' })
    });
    const loginBody = await loginRes.text();
    console.log('LOGIN STATUS:', loginRes.status);
    console.log('LOGIN BODY:', loginBody);

    if (!loginRes.ok) return;
    const loginJson = JSON.parse(loginBody);
    const token = loginJson.data?.token || loginJson.token || loginJson?.data?.accessToken;
    if (!token) {
      console.error('No token found in login response');
      return;
    }
    console.log('\nTOKEN:', token);

    // get usuarios
    const usuariosRes = await fetch(`${base}/api/v1/auth/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('\nGET /api/v1/auth/usuarios STATUS:', usuariosRes.status);
    console.log('BODY:', await usuariosRes.text());

  } catch (err) {
    console.error('Error in test script:', err);
  }
})();
