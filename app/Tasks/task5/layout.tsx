import { redirect } from "next/navigation";
import { getTeam } from "@/app/lib/auth";

export default async function Task5Layout({ children }: { children: React.ReactNode }) {
    const team = await getTeam();
    if (!team || team.progress < 4) {
        redirect("/dashboard");
    }
    return <>{children}</>;
}
