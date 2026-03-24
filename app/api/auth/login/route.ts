import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { Team } from "@/app/lib/models/Team";
import { encrypt } from "@/app/lib/auth";
import { cookies } from "next/headers";

const SHARED_PASSWORD = process.env.SHARED_PASSWORD || "ghost41";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (password !== SHARED_PASSWORD) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        await connectDB();

        const cleanUsername = username.trim().toLowerCase();

        // ── Team progression and identification based on login ──
        let team = await Team.findOne({ username: cleanUsername });

        // Reject if team not found (no auto-registration)
        if (!team) {
            return NextResponse.json({ error: "Team not found. Please contact administration." }, { status: 401 });
        }

        // Generate session JWT
        const sessionPayload = {
            username: team.username,
        };

        const session = await encrypt(sessionPayload);

        // Set HTTP-only cookie
        const cookieStore = await cookies();
        cookieStore.set("session", session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

        return NextResponse.json({ success: true, team });
    } catch (err: any) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
