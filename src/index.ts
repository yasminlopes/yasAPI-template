import { startServer } from '@app/server';

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
