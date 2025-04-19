// ESM version
import { PrismaClient } from '@prisma/client';

// Create Prisma client with logging options
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
});

// Connection management
const connectWithRetry = async () => {
  let retries = 5;
  let connected = false;

  while (retries > 0 && !connected) {
    try {
      console.log('Attempting to connect to database...');
      await prisma.$connect();
      connected = true;
      console.log('Successfully connected to database');
    } catch (error) {
      console.error(`Failed to connect to database (retries left: ${retries}):`, error.message);
      retries--;
      // Wait for 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!connected) {
    console.error('Failed to connect to database after multiple attempts');
    // Don't exit the process, allow the application to handle this gracefully
  }
};

// Initialize connection
connectWithRetry().catch(e => {
  console.error('Initial database connection failed:', e);
});

// Gracefully disconnect on app termination
process.on('SIGINT', async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

// Optional: handle log events from Prisma (for debugging)
if (process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true') {
  prisma.$on('query', (e) => {
    console.log('Query:', e.query);
  });
}

export default prisma;
