import express from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const router = express.Router();

const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "matunda_db",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

router.post("/", async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, customerCity, customerNotes, items, total, paymentMethod, referenceId } = req.body;
    if (!customerName || !customerPhone || !items || !total) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const order = await prisma.order.create({
      data: {
        customerName, customerPhone,
        customerAddress: customerAddress || null,
        customerCity: customerCity || null,
        customerNotes: customerNotes || null,
        total: Number(total),
        paymentMethod: paymentMethod || "Mobile Money",
        referenceId: referenceId || null,
        status: "pending",
        items: {
          create: items.map((i) => ({
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
          })),
        },
      },
      include: { items: true },
    });
    res.status(201).json(order);
  } catch (e) {
    console.error("POST /orders error:", e);
    res.status(500).json({ error: e.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });
    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;