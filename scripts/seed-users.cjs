const { Client } = require('pg');
const crypto = require('crypto');

// Simple bcrypt-like hash using pbkdf2 won't work since we need bcrypt
// Let's use the pg client to insert users via psql on host
const { execSync } = require('child_process');

const DB_URL = 'postgresql://rtx:RtxSystem2026!SecureDb@localhost:5432/rtx';

async function seed() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to DB');

  // Check if bcrypt module available in node_modules
  let bcrypt;
  try {
    bcrypt = require('/app/node_modules/bcryptjs');
  } catch(e) {
    console.error('bcryptjs not found:', e.message);
    process.exit(1);
  }

  const users = [
    { name: 'OPEN APPS', phone: '01558282760', password: '1', role: 'MANAGER' },
    { name: 'Ali', phone: '01067662255', password: '123456', role: 'MANAGER' },
    { name: 'Mostafa', phone: '01125692128', password: '123456', role: 'USER' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const id = crypto.randomUUID();
    try {
      await client.query(
        `INSERT INTO "User" (id, name, phone, password, role, "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (phone) DO UPDATE SET name=$2, password=$4, role=$5`,
        [id, u.name, u.phone, hash, u.role]
      );
      console.log('OK:', u.name);
    } catch(e) {
      console.error('ERR:', u.name, e.message);
    }
  }

  await client.end();
  console.log('Done!');
}

seed().catch(e => { console.error(e); process.exit(1); });
