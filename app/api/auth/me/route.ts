import { NextResponse } from "next/server";
import { getTeam } from "@/app/lib/auth";

export async function GET() {
    try {
        const team = await getTeam();

        if (!team) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            team: {
                username: team.username,
                progress: team.progress,
                isDisqualified: team.isDisqualified
            }
        });
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
