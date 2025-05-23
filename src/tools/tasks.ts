import type { LawmaticsClientWrapper } from "@/client/lawmatics";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BaseTools } from "./base";

export class TasksTools extends BaseTools {
	static create(client: LawmaticsClientWrapper, server: McpServer) {
		const tools = new TasksTools(client);

		server.tool(
			"list_tasks",
			"List all tasks with optional filtering and pagination",
			{
				matter_id: z.string().optional().describe("Filter by matter ID"),
				prospect_id: z.string().optional().describe("Filter by prospect ID"),
				contact_id: z.string().optional().describe("Filter by contact ID"),
				company_id: z.string().optional().describe("Filter by company ID"),
				client_id: z.string().optional().describe("Filter by client ID"),
				user_id: z.string().optional().describe("Filter by user ID"),
				page: z.number().int().positive().optional().default(1).describe("Page number (1-based)"),
				limit: z
					.number()
					.int()
					.positive()
					.max(100)
					.optional()
					.default(25)
					.describe("Number of items per page (max 100)"),
			},
			async (params) => await tools.listTasks(params),
		);

		return tools;
	}

	async listTasks(params: {
		matter_id?: string;
		prospect_id?: string;
		contact_id?: string;
		company_id?: string;
		client_id?: string;
		user_id?: string;
		page?: number;
		limit?: number;
	}): Promise<CallToolResult> {
		const response = await this.client.getTasks({
			matter_id: params.matter_id,
			prospect_id: params.prospect_id,
			contact_id: params.contact_id,
			company_id: params.company_id,
			client_id: params.client_id,
			user_id: params.user_id,
			page: params.page,
			limit: params.limit,
		});

		const tasks = response?.data || [];
		const meta = response?.meta || {};

		if (tasks.length === 0) {
			return this.toResult("No tasks found matching the criteria.");
		}

		const total = meta.total_entries || tasks.length;
		const totalPages = meta.total_pages || Math.ceil(total / (params.limit || 25));

		const tasksList = tasks
			.map((task) => {
				const dueDate = task.attributes.due_date
					? new Date(task.attributes.due_date).toLocaleString()
					: "No due date";
				const status = task.attributes.done ? "✅ Done" : "⏳ Pending";
				const priority = task.attributes.priority ? `(${task.attributes.priority})` : "";
				const tags = task.attributes.tags?.map((t) => `#${t.name}`).join(", ") || "No tags";

				return (
					`📝 ${task.attributes.name} ${priority}\n` +
					`  • Status: ${status}\n` +
					`  • Due: ${dueDate}\n` +
					`  • ID: ${task.id}\n` +
					`  • Tags: ${tags}`
				);
			})
			.join("\n\n");

		let result = `Tasks (Page ${params.page} of ${totalPages}, Showing ${tasks.length} of ${total} total):\n\n${tasksList}`;

		if (meta.total_pages && meta.total_pages > (params.page || 1)) {
			result += `\n\nNote: There are more tasks available. Use the 'page' parameter to see more.`;
		}

		return this.toResult(result);
	}
}
