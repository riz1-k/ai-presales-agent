"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Loader from "./loader";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						router.push("/dashboard");
						toast.success("Welcome back!");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.string().email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="fade-in slide-in-from-bottom-4 w-full max-w-md animate-in duration-700 ease-out">
			<Card className="group relative overflow-hidden rounded-2xl border-muted-foreground/20 bg-card/50 shadow-2xl backdrop-blur-xl">
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

				<CardHeader className="relative space-y-1 pb-8 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110">
						<Lock className="h-6 w-6" />
					</div>
					<CardTitle className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text font-bold text-3xl text-transparent tracking-tight">
						Welcome Back
					</CardTitle>
					<CardDescription className="text-muted-foreground transition-colors group-hover:text-foreground/70">
						Enter your credentials to access your workspace
					</CardDescription>
				</CardHeader>

				<CardContent className="relative">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-5"
					>
						<div className="space-y-4">
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label
											htmlFor={field.name}
											className="ml-1 font-semibold text-foreground/70 text-xs uppercase tracking-wider"
										>
											Email Address
										</Label>
										<div className="group/input relative">
											<div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/input:text-primary">
												<Mail className="h-4 w-4" />
											</div>
											<Input
												id={field.name}
												name={field.name}
												type="email"
												placeholder="name@example.com"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="h-12 rounded-xl border-muted-foreground/20 bg-background/50 pl-10 transition-all focus:border-primary/50 focus:ring-primary/20"
											/>
										</div>
										{field.state.meta.errors.map((error) => (
											<p
												key={error?.message}
												className="fade-in slide-in-from-top-1 ml-1 animate-in font-medium text-[11px] text-destructive"
											>
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>

							<form.Field name="password">
								{(field) => (
									<div className="space-y-2">
										<div className="flex items-center justify-between px-1">
											<Label
												htmlFor={field.name}
												className="font-semibold text-foreground/70 text-xs uppercase tracking-wider"
											>
												Password
											</Label>
											<Button
												variant="link"
												className="h-auto p-0 font-medium text-primary/80 text-xs hover:text-primary"
											>
												Forgot password?
											</Button>
										</div>
										<div className="group/input relative">
											<div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/input:text-primary">
												<Lock className="h-4 w-4" />
											</div>
											<Input
												id={field.name}
												name={field.name}
												type="password"
												placeholder="••••••••"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="h-12 rounded-xl border-muted-foreground/20 bg-background/50 pl-10 transition-all focus:border-primary/50 focus:ring-primary/20"
											/>
										</div>
										{field.state.meta.errors.map((error) => (
											<p
												key={error?.message}
												className="fade-in slide-in-from-top-1 ml-1 animate-in font-medium text-[11px] text-destructive"
											>
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="h-12 w-full rounded-xl bg-primary font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] hover:shadow-primary/30 active:scale-[0.99]"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? (
										<div className="flex items-center gap-2">
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
											<span>Signing in...</span>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<span>Sign In</span>
											<ArrowRight className="h-4 w-4" />
										</div>
									)}
								</Button>
							)}
						</form.Subscribe>
					</form>
				</CardContent>

				<CardFooter className="relative flex flex-col gap-4 pt-4 pb-8">
					<p className="text-center text-muted-foreground text-sm">
						Don&apos;t have an account?{" "}
						<button
							type="button"
							onClick={onSwitchToSignUp}
							className="font-semibold text-primary underline-offset-4 hover:underline"
						>
							Sign up for free
						</button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
