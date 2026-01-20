import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

/**
 * Safely parse date string to JS Date
 * Works with ISO strings & locale strings
 */
function parseDateTime(dateStr) {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  return date;
}

export async function POST(req) {
  let connection;

  try {
    const body = await req.json();

    // 🔹 Basic validation
    if (!body.vehicleNo || body.vehicleNo === "-") {
      return NextResponse.json(
        { status: "failed", message: "Invalid vehicleNo" },
        { status: 400 }
      );
    }

    // 🔹 Parse dates safely
    const lastAssignedDate = parseDateTime(body.lastAssigned);
    const recordTimeDate = parseDateTime(body.recordTime);
    const triggerTimeDate = parseDateTime(body.triggerTime);
    const expectedStopDate = parseDateTime(body.expectedStop);

    // 🔹 Connect DB
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      timezone: "Z", // store in UTC
    });

    // 1️⃣ INSERT into ambulance_remarks
    const insertSql = `
      INSERT INTO ambulance_remarks
      (
        vehicleNo,
        speed,
        lastAssigned,
        recordTime,
        triggerTime,
        district,
        location,
        contactNo,
        selectedRemark,
        otherRemarks,
        expected_stop,
        submittedBy,
        submittedById
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      body.vehicleNo,
      body.speed ?? null,
      lastAssignedDate,
      recordTimeDate,
      triggerTimeDate,
      body.district ?? null,
      body.location ?? null,
      body.contactNo ?? null,
      body.selectedRemark ?? null,
      body.otherRemarks ?? null,
      expectedStopDate,
      body.submittedBy ?? null,
      body.submittedById ?? null,
    ];

    await connection.execute(insertSql, insertValues);

    // 2️⃣ UPDATE vehicle_status
    const updateSql = `
      UPDATE emri.vehicle_status
      SET
        triger_agent = NULL,
        expected_stop = ?,
        trigger_handle_time = ?
      WHERE Vehicle_Number = ?
    `;

    await connection.execute(updateSql, [
      expectedStopDate,      // ✅ NULL or Date
      new Date(),            // current time
      body.vehicleNo,
    ]);

    return NextResponse.json({ status: "success" });

  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { status: "failed", error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
