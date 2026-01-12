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
		<main className="relative flex-1 overflow-y-auto bg-background/30 backdrop-blur-3xl">
			{/* Modern Background Elements */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/10 blur-[120px]" />
				<div className="absolute right-[-10%] bottom-[-10%] h-[30%] w-[30%] rounded-full bg-primary/5 blur-[100px]" />
				<div className="absolute inset-0 bg-[size:32px_32px] bg-grid-white/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />
			</div>

			<div className="relative">
				<Dashboard />
			</div>
		</main>
	);
}
