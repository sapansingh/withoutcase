"use server";

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Connect to MySQL
    const connection = await mysql.createConnection(dbConfig);

    // Fetch user by user_id
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE user_id = ? LIMIT 1",
      [username]
    );

    await connection.end();

    if (!rows.length) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Plain text password comparison
    if (password !== user.user_pass) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, username: user.user_id, role: user.roll },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return response with HttpOnly cookie AND token in JSON
    const response = NextResponse.json({
      status: "success",
      token, // JWT included in JSON
      user: {
        id: user.id,
        username: user.user_name,
        user_id: user.user_id,
        role: user.roll,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true, // cannot be accessed by JS
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // cookie available for entire site
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
