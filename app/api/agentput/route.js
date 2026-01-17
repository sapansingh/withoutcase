import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { agentId, vehicleNo } = body;

    // validation
    if (!vehicleNo || vehicleNo === "" || !agentId || agentId === "") {
      return NextResponse.json({
        status: "failed",
        message: "Missing agentId or vehicleNo",
      });
    }

    // connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // update query — update assigned agent for the vehicle
    const sql = `
      UPDATE emri.vehicle_status
      SET triger_agent = ?
      WHERE Vehicle_Number = ?
    `;

    const values = [agentId, vehicleNo];

    const [result] = await connection.execute(sql, values);

    await connection.end();

    // check if update happened
    if (result.affectedRows === 0) {
      return NextResponse.json({
        status: "failed",
        message: "No rows updated — invalid vehicleNo?",
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({
      status: "failed",
      error: error.message || "Unknown error",
    });
  }
}
