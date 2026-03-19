const { PrismaClient } = require('@prisma/client');
try {
  const p = new PrismaClient();
  console.log('OK');
} catch(e) {
  const fs = require('fs');
  fs.writeFileSync('prisma-error.txt', e.message);
  console.log('Error written to prisma-error.txt');
}
