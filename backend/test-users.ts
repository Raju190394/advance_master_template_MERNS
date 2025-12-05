const API_URL = 'http://localhost:5000/api/v1';

async function testUsersEndpoint() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'superadmin@admin.com',
                password: 'SuperAdmin@123'
            })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        }

        const token = loginData.data.token;
        console.log('Login successful, token received');

        // 2. Get Users
        console.log('\nFetching users (page=1, limit=10)...');
        const usersRes = await fetch(`${API_URL}/users?page=1&limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const usersData = await usersRes.json();
        console.log('Users response status:', usersRes.status);
        console.log('Users data:', JSON.stringify(usersData, null, 2));

    } catch (error) {
        console.error('Error occurred:', error);
    }
}

testUsersEndpoint();
