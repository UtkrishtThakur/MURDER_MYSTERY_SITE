import { redirect } from "next/navigation";
import { getTeam } from "@/app/lib/auth";

export default async function TasksLayout({ children }: { children: React.ReactNode }) {
    const team = await getTeam();

    if (!team) {
        redirect("/login");
    }

    if (team.isDisqualified) {
        redirect("/disqualified");
    }

    return <>{children}</>;
}
