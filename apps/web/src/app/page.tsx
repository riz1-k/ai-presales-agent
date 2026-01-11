"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowRight,
	BarChart3,
	ShieldCheck,
	Sparkles,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

export default function Home() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());

	return (
		<div className="flex h-full flex-col overflow-y-auto">
			{/* Hero Section */}
			<section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
				<div className="absolute inset-0 -z-10 overflow-hidden">
					<div className="absolute top-1/2 left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-primary/20 blur-[120px]" />
					<div className="absolute inset-0 bg-[size:32px_32px] bg-grid-white/[0.02]" />
				</div>

				<div className="fade-in slide-in-from-bottom-8 animate-in duration-1000">
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-sm backdrop-blur-md">
						<Sparkles className="h-4 w-4 text-primary" />
						<span className="font-medium">
							The Future of Presales Efficiency
						</span>
					</div>

					<h1 className="mb-6 font-extrabold text-4xl tracking-tight sm:text-6xl lg:text-7xl">
						Win More Deals with <br />
						<span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
							AI-Powered Presales
						</span>
					</h1>

					<p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
						Automate information gathering, proposal writing, resource planning,
						and WBS generation. Our agent guides your discovery sessions and
						generates professional documents in real-time.
					</p>

					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Link href="/dashboard">
							<Button
								size="lg"
								className="h-12 gap-2 px-8 font-semibold text-lg"
							>
								Get Started <ArrowRight className="h-5 w-5" />
							</Button>
						</Link>
						<Link href="/ai">
							<Button
								size="lg"
								variant="outline"
								className="h-12 px-8 font-semibold text-lg"
							>
								Try Demo
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto max-w-6xl px-4 py-24">
				<div className="grid gap-8 md:grid-cols-3">
					<div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
							<Zap className="h-6 w-6" />
						</div>
						<h3 className="mb-2 font-bold text-xl">Smart Discovery</h3>
						<p className="text-muted-foreground">
							Interactive AI companion that identifies missing critical info and
							steers conversations to closure.
						</p>
					</div>
					<div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
							<BarChart3 className="h-6 w-6" />
						</div>
						<h3 className="mb-2 font-bold text-xl">Real-time Docs</h3>
						<p className="text-muted-foreground">
							Proposals, resource plans, and work breakdown structures update
							instantly as requirements emerge.
						</p>
					</div>
					<div className="rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
							<ShieldCheck className="h-6 w-6" />
						</div>
						<h3 className="mb-2 font-bold text-xl">Approvals Flow</h3>
						<p className="text-muted-foreground">
							Integrated workflow for stakeholder review, comments, and formal
							sign-offs on all generated documents.
						</p>
					</div>
				</div>
			</section>

			{/* Health Status (Footer) */}
			<footer className="border-t py-8">
				<div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
					<p className="text-muted-foreground text-sm">
						© 2026 AI Presales Agent. All rights reserved.
					</p>
					<div className="flex items-center gap-2">
						<div
							className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
						/>
						<span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
							System Status:{" "}
							{healthCheck.isLoading
								? "Checking..."
								: healthCheck.data
									? "Healthy"
									: "Issues Detected"}
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
