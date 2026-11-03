import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const email = "admin@matunda.com";
const password = "admin123";

const hash = await bcrypt.hash(password, 12);

await prisma.user.create({
  data: {
    email,
    password: hash,
    role: "ADMIN",
  },
});

console.log("✅ Admin user created!");
console.log("Email:", email);
console.log("Password:", password);

await prisma.$disconnect();