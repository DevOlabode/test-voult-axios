const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json('Hello World!');
});

app.post('/register', async (req, res) => {
  try {
    const response = await axios.post(
      'https://voult.dev/api/register',
      {
        fullName: "Samuel Olabode",
        email: "solabode499@gmail.com",
        password: "Sammy**34J123%"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': process.env.CLIENT_ID,
          'x-client-secret': process.env.CLIENT_SECRET
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error(error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data || "Something went wrong"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
