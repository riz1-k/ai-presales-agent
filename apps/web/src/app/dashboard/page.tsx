import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Dashboard from "./dashboard";

export default async function DashboardPage() {
	const session = await authClient.getSession({
		fetchOptions: {
			headers: await headers(),
			throw: true,
		},
	});

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<main className="flex-1 overflow-y-auto bg-background/50 backdrop-blur-3xl">
			<div className="pointer-events-none absolute inset-0 bg-[size:32px_32px] bg-grid-white/[0.02]" />
			<div className="relative">
				<Dashboard />
			</div>
		</main>
	);
}
