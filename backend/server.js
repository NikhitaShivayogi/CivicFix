require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { seedAdmin } = require('./utils/seeder');

(async () => {
  await connectDB();

  try {
    await seedAdmin();
  } catch (error) {
    console.error('Admin seed failed:', error.message);
  }

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
