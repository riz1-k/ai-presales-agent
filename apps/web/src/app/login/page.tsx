"use client";

import { useState } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function LoginPage() {
	const [showSignIn, setShowSignIn] = useState(true);

	return (
		<div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background lg:flex-row">
			{/* Left Side: Form Section */}
			<div className="z-10 flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
				<div className="w-full max-w-md space-y-8">
					<div className="mb-8 flex flex-col gap-2 text-center lg:text-left">
						<div className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
								<span className="font-bold text-primary-foreground text-xl">
									A
								</span>
							</div>
							<span className="font-bold text-2xl tracking-tight">
								Presales Agent
							</span>
						</div>
					</div>

					<div className="relative">
						<div className={showSignIn ? "block" : "hidden"}>
							<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
						</div>
						<div className={!showSignIn ? "block" : "hidden"}>
							<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
						</div>
					</div>
				</div>

				<div className="mt-auto pt-8 text-center text-muted-foreground text-sm">
					&copy; {new Date().getFullYear()} AI Presales Agent. All rights
					reserved.
				</div>
			</div>
		</div>
	);
}
