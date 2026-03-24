import { redirect } from "next/navigation";
import { getTeam } from "@/app/lib/auth";

export default async function Task1Layout({ children }: { children: React.ReactNode }) {
    // Task 1 is unlocked as soon as progress >= 0, handled by general TasksLayout
    return <>{children}</>;
}
