import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute("SELECT remark FROM remarks");
    await connection.end();

    // Send back an array of strings
    const remarkList = rows.map((r) => r.remark);

    return NextResponse.json(remarkList);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ status: "failed", error: error.message });
  }
}
