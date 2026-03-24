import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "./db";
import { Team, ITeam } from "./models/Team";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_FALLBACK_KEY_MURDER_MYSTERY_2026";
const key = new TextEncoder().encode(JWT_SECRET);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch {
        return null;
    }
}

export async function getTeam(): Promise<ITeam | null> {
    const session = await getSession();
    if (!session?.username) return null;
    await connectDB();
    const team = await Team.findOne({ username: session.username });
    return team;
}
