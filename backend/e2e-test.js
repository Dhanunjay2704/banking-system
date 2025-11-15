(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const rand = Math.floor(Math.random() * 100000);
    const email = `e2e${rand}@example.com`;
    console.log('Registering customer', email);

    let res = await fetch(`${base}/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E User', email, phone: `90000${rand % 10000}`, password: 'e2epass' }),
    });
    let json = await res.json();
    console.log('Register:', res.status, json.message || JSON.stringify(json));

    // admin login
    res = await fetch(`${base}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bank.com', password: 'admin123' }),
    });
    json = await res.json();
    if (res.status !== 200) throw new Error('admin login failed: ' + JSON.stringify(json));
    const adminToken = json.token;
    console.log('Admin login ok');

    // find pending and approve
    res = await fetch(`${base}/admin/pending`, { headers: { Authorization: `Bearer ${adminToken}` } });
    json = await res.json();
    const me = json.find(u => u.email === email);
    if (!me) throw new Error('pending user not found');
    console.log('Found pending id', me._id);

  res = await fetch(`${base}/admin/approve/${me._id}`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
  json = await res.json();
  console.log('Approve:', res.status, JSON.stringify(json));

  // customer login - note: approve returns a tempPassword that replaces original
  const temp = json.tempPassword || 'e2epass';
  res = await fetch(`${base}/customer/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: temp }) });
    json = await res.json();
    if (res.status !== 200) throw new Error('customer login failed: ' + JSON.stringify(json));
    const custToken = json.token;
    console.log('Customer login ok');

    // deposit
    res = await fetch(`${base}/customer/deposit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${custToken}` }, body: JSON.stringify({ amount: 250, description: 'E2E deposit' }) });
    json = await res.json();
    console.log('Deposit:', res.status, JSON.stringify(json));

    // statement
    res = await fetch(`${base}/customer/statement`, { headers: { Authorization: `Bearer ${custToken}` } });
    json = await res.json();
    console.log('Statement count:', Array.isArray(json) ? json.length : JSON.stringify(json));

    console.log('E2E test completed successfully');
  } catch (err) {
    console.error('E2E test failed:', err);
    process.exit(1);
  }
})();