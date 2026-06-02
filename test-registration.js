const axios = require('axios');

const testRegistration = async () => {
  try {
    const registrationData = {
      name: "Test User",
      email: "test@example.com",
      password: "TestPassword123!",
      department: "IT",
      position: "Developer"
    };

    console.log('Testing registration endpoint...');
    
    const response = await axios.post('http://localhost:3000/api/auth/register', registrationData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
  }
};

testRegistration();