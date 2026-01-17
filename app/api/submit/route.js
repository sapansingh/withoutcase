import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    // basic validation
    if (!body.vehicleNo || body.vehicleNo === "-") {
      return NextResponse.json({ status: "failed", message: "Invalid vehicleNo" });
    }

    // Connect to DB
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // 1️⃣ Insert into ambulance_remarks
    const insertSql = `
      INSERT INTO ambulance_remarks 
      (vehicleNo, speed, lastAssigned, recordTime, triggerTime, district, location, contactNo, selectedRemark, otherRemarks, expected_stop, submittedBy, submittedById)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const lastAssignedDate = body.lastAssigned ? new Date(body.lastAssigned) : null;
    const recordTimeDate = body.recordTime ? new Date(body.recordTime) : null;
    const triggerTimeDate = body.triggerTime ? new Date(body.triggerTime) : null;
    const expectedStopDate = body.expectedStop ? new Date(body.expectedStop) : null;

    const values = [
      body.vehicleNo,
      body.speed,
      lastAssignedDate,
      recordTimeDate,
      triggerTimeDate,
      body.district || null,
      body.location || null,
      body.contactNo || null,
      body.selectedRemark || null,
      body.otherRemarks || null,
      expectedStopDate,
      body.submittedBy || null,
      body.submittedById || null,
    ];

    await connection.execute(insertSql, values);

    // 2️⃣ Update emri.vehicle_status table
    const updateSql = `
      UPDATE emri.vehicle_status
      SET triger_agent=null, expected_stop = ?, trigger_handle_time = ?
      WHERE Vehicle_Number = ?
    `;

    // if you want to set empty string when no value
    const expectedStopUpdate = expectedStopDate ? expectedStopDate : "";
    const triggerHandleTimeUpdate = new Date(); // set current time

    await connection.execute(updateSql, [
      expectedStopUpdate,
      triggerHandleTimeUpdate,
      body.vehicleNo,
    ]);

    await connection.end();

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ status: "failed", error: error.message });
  }
}
