import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const csvFilePath = path.join(process.cwd(), 'SHEETS', 'Login - Login.csv');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found at ${csvFilePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${records.length} records to import...`);

  for (const record of records as any[]) {
    const { Name, 'Phone Number': Phone, Password, Position, Jop } = record;

    if (!Name || !Phone || !Password) {
      console.log(`Skipping record due to missing required fields (Name/Phone/Password): ${Name}`);
      continue;
    }

    const role = (Position === 'Admin' || Position === 'Manager') ? 'MANAGER' : 'USER';
    const hashedPassword = await bcrypt.hash(Password, 10);

    try {
      await prisma.user.upsert({
        where: { phone: Phone },
        update: {
          name: Name,
          password: hashedPassword,
          role,
          job: Jop || null,
        },
        create: {
          name: Name,
          phone: Phone,
          password: hashedPassword,
          role,
          job: Jop || null,
        },
      });
      console.log(`Successfully imported user: ${Name} (${role})`);
    } catch (e) {
      console.error(`Error importing user ${Name}:`, e);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
