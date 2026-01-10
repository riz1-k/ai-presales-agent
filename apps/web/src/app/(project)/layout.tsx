import type { ReactNode } from "react";

interface ProjectLayoutProps {
	children: ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
	return <div className="flex h-full flex-col overflow-hidden">{children}</div>;
}
