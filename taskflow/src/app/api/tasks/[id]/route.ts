import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "tasks.json");

async function loadDB() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveDB(db: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export async function GET(req: Request, ctx: any) {
  const { uid } = ctx.params;
  const db = await loadDB();
  return NextResponse.json(db[uid] || []);
}

export async function POST(req: Request, ctx: any) {
  const { uid } = ctx.params;
  const db = await loadDB();
  const body = await req.json();

  if (!db[uid]) db[uid] = [];

  const newTask = { ...body, id: crypto.randomUUID(), subTasks: [] };
  db[uid].push(newTask);

  await saveDB(db);
  return NextResponse.json(newTask);
}

export async function PUT(req: Request, ctx: any) {
  const { uid } = ctx.params;
  const db = await loadDB();
  const body = await req.json();

  db[uid] = db[uid].map((t: any) => (t.id === body.id ? body : t));

  await saveDB(db);
  return NextResponse.json(body);
}

export async function DELETE(req: Request, ctx: any) {
  const { uid } = ctx.params;
  const db = await loadDB();
  const { id } = await req.json();

  db[uid] = db[uid].filter((t: any) => t.id !== id);

  await saveDB(db);
  return NextResponse.json({ ok: true });
}
