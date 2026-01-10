import { protectedProcedure, publicProcedure, router } from "../index";
import { approvalsRouter } from "./approvals";
import { conversationsRouter } from "./conversations";
import { documentsRouter } from "./documents";
import { projectsRouter } from "./projects";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),

	// Project-related routers
	projects: projectsRouter,
	conversations: conversationsRouter,
	documents: documentsRouter,
	approvals: approvalsRouter,
});
export type AppRouter = typeof appRouter;
