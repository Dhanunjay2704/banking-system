const http = require('http');

const testLogin = async () => {
  console.log('🔍 Testing Admin Login...\n');

  const postData = JSON.stringify({
    email: 'admin@bank.com',
    password: 'admin123',
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('\n✅ Login Successful!\n');
        console.log('Token:', response.token.substring(0, 50) + '...');
        console.log('Admin:', JSON.stringify(response.admin, null, 2));
      } else {
        console.log('\n❌ Login Failed!');
        console.log('Error:', response);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
  });

  req.write(postData);
  req.end();
};

testLogin();
