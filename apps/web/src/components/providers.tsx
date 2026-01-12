"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSettings } from "@/hooks/use-settings";
import { queryClient } from "@/utils/trpc";
import { AppSidebar } from "./app-sidebar";
import { ThemeProvider } from "./theme-provider";
import { SidebarProvider } from "./ui/sidebar";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	const { settings } = useSettings();
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				<SidebarProvider defaultOpen={settings.sidebar.defaultOpen}>
					<AppSidebar />
					<section className="mt-2 w-full pt-3">{children}</section>
				</SidebarProvider>
				<ReactQueryDevtools />
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
