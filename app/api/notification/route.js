import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

/**
 * Convert UTC Date → IST Railway format
 * Output: YYYY-MM-DD HH:mm:ss
 */
function toISTRailway(date) {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  // sv-SE gives perfect YYYY-MM-DD HH:mm:ss
  return d
    .toLocaleString("sv-SE", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    })
    .replace("T", " ");
}

export async function GET(req) {
  let connection;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { status: "failed", message: "UserId required" },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
      SELECT 
        vs.Vehicle_Number,
        ftl.Speed,
        vs.last_assigned_time,
        ftl.Rec_Time,
        emd.district_name,
        mv.location_name,
        mv.contact_number
      FROM emri.vehicle_status vs
      JOIN emri.m_vehicle mv ON mv.vehicle_no = vs.Vehicle_Number
      JOIN federated.T_LatestData ftl ON ftl.VehicleNumber = vs.Vehicle_Number
      JOIN emri.m_district emd ON emd.district_id = mv.district_id
      WHERE vs.status_id = '1'
        AND mv.is_active = '1'
        AND mv.vehicle_type_id IN ('108','420')
        AND ftl.Speed > 10
        AND (
          vs.triger_agent IS NULL
          OR vs.triger_agent = ''
          OR vs.triger_agent = '-'
          OR vs.triger_agent = ?
        )
        AND (vs.expected_stop < NOW() OR vs.expected_stop IS NULL)
        AND ftl.Rec_Time >= NOW() - INTERVAL 1 HOUR
      LIMIT 1
      `,
      [userId]
    );

    const data = rows.map((r) => ({
      Vehicle_Number: r.Vehicle_Number,
      Speed: r.Speed,
      district_name: r.district_name,
      location_name: r.location_name,
      contact_number: r.contact_number,

      // ✅ IST Railway Time
      last_assigned_time: toISTRailway(r.last_assigned_time),
      Rec_Time: toISTRailway(r.Rec_Time),
      trigger_time: toISTRailway(r.last_assigned_time),
    }));

    return NextResponse.json({
      status: "success",
      data,
    });
  } catch (err) {
    console.error("Error fetching vehicle:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
