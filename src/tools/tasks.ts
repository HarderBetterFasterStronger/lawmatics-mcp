import type { LawmaticsClientWrapper, RecurrenceRule } from "@/client/lawmatics";
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

		server.tool(
			"create_task",
			"Create a new task with the given details",
			{
				name: z.string().describe("Name of the task (required)"),
				description: z.string().optional().describe("Description of the task"),
				due_date: z.string().optional().describe("Due date in YYYY-MM-DD format"),
				user_ids: z
					.array(z.string())
					.optional()
					.describe("Array of user IDs to assign the task to"),
				priority: z
					.enum(["high", "medium", "low"])
					.optional()
					.default("low")
					.describe("Priority of the task"),
				done: z.boolean().optional().default(false).describe("Whether the task is completed"),
				taskable_type: z
					.enum(["Prospect", "Contact", "Company", "Client"])
					.optional()
					.describe("Type of the associated record"),
				taskable_id: z.string().optional().describe("ID of the associated record"),
				tag_ids: z
					.array(z.string())
					.optional()
					.describe("Array of tag IDs to associate with the task"),
				assigned_by_id: z.string().optional().describe("ID of the user who assigned the task"),
				// Recurrence rule fields
				recurrence_type: z
					.enum(["daily", "weekly", "monthly", "yearly"])
					.optional()
					.describe("Type of recurrence"),
				recurrence_end_date: z
					.string()
					.optional()
					.describe("End date for recurrence in YYYY-MM-DD format"),
				recurrence_frequency: z
					.number()
					.int()
					.positive()
					.optional()
					.describe("Frequency of recurrence (e.g., every X days/weeks/months)"),
				// Weekly specific
				weekly_days: z
					.array(
						z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]),
					)
					.optional()
					.describe("Days of the week for weekly recurrence"),
				// Monthly specific
				monthly_day: z
					.number()
					.int()
					.min(1)
					.max(31)
					.optional()
					.describe("Day of the month for monthly recurrence"),
				// Yearly specific
				yearly_month: z
					.string()
					.optional()
					.describe("Month for yearly recurrence (e.g., 'January')"),
				yearly_day: z
					.number()
					.int()
					.min(1)
					.max(31)
					.optional()
					.describe("Day of the month for yearly recurrence"),
			},
			async (params) => await tools.createTask(params),
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
		const response = await this.client.getTasks(params);
		const tasks = response?.data || [];

		if (tasks.length === 0) {
			return {
				content: [{ type: "text", text: "No tasks found matching the specified criteria." }],
			};
		}

		// Format tasks for display
		const formattedTasks = tasks.map((task) => {
			const status = task.attributes.done ? "✅ Done" : "⏳ Pending";
			const dueDate = task.attributes.due_date
				? new Date(task.attributes.due_date).toLocaleString()
				: "No due date";

			const tags =
				task.attributes.tags && task.attributes.tags.length > 0
					? task.attributes.tags.map((tag) => `#${tag.name}`).join(", ")
					: "No tags";

			return `📝 ${task.attributes.name} (${task.attributes.priority})\n  • Status: ${status}\n  • Due: ${dueDate}\n  • ID: ${task.id}\n  • Tags: ${tags}`;
		});

		// Add pagination info if available
		let paginationInfo = "";
		if (response?.meta) {
			const totalPages = response.meta.total_pages || 1;
			const currentPage = params.page || 1;
			const totalCount = response.meta.total_entries || tasks.length;

			paginationInfo = `\n\nPage ${currentPage} of ${totalPages} (${totalCount} total tasks)`;

			if (currentPage < totalPages) {
				paginationInfo += `\nNote: There are more tasks available. Use the 'page' parameter to see more.`;
			}
		}

		const content = `Tasks:${paginationInfo ? `\n${paginationInfo}\n` : "\n"}${formattedTasks.join("\n\n")}`;

		return {
			content: [{ type: "text", text: content }],
		};
	}

	/**
	 * Create a new task with the given parameters
	 */
	async createTask(params: {
		name: string;
		description?: string;
		due_date?: string;
		user_ids?: string[];
		priority?: "high" | "medium" | "low";
		done?: boolean;
		taskable_type?: "Prospect" | "Contact" | "Company" | "Client";
		taskable_id?: string;
		tag_ids?: string[];
		assigned_by_id?: string;
		// Recurrence fields
		recurrence_type?: "daily" | "weekly" | "monthly" | "yearly";
		recurrence_end_date?: string;
		recurrence_frequency?: number;
		weekly_days?: string[];
		monthly_day?: number;
		yearly_month?: string;
		yearly_day?: number;
	}): Promise<CallToolResult> {
		try {
			// Prepare the task data
			const taskData: {
				name: string;
				description?: string;
				due_date?: string;
				user_ids?: string[];
				priority?: "high" | "medium" | "low";
				done?: boolean;
				taskable_type?: "Prospect" | "Contact" | "Company" | "Client";
				taskable_id?: string;
				tag_ids?: string[];
				assigned_by_id?: string;
				recurrence_rule?: RecurrenceRule;
			} = {
				name: params.name,
			};

			// Add optional fields
			if (params.description) taskData.description = params.description;
			if (params.due_date) taskData.due_date = params.due_date;
			if (params.user_ids && params.user_ids.length > 0) taskData.user_ids = params.user_ids;
			if (params.priority) taskData.priority = params.priority;
			if (params.done !== undefined) taskData.done = params.done;
			if (params.taskable_type) taskData.taskable_type = params.taskable_type;
			if (params.taskable_id) taskData.taskable_id = params.taskable_id;
			if (params.tag_ids && params.tag_ids.length > 0) taskData.tag_ids = params.tag_ids;
			if (params.assigned_by_id) taskData.assigned_by_id = params.assigned_by_id;

			// Handle recurrence rule if specified
			if (params.recurrence_type) {
				const recurrenceRule: RecurrenceRule = {
					type: params.recurrence_type,
				};

				if (params.recurrence_end_date) {
					recurrenceRule.endDate = params.recurrence_end_date;
				}

				// Set frequency for daily or interval for other types
				if (params.recurrence_frequency) {
					if (params.recurrence_type === "daily") {
						recurrenceRule.frequency = params.recurrence_frequency;
					} else if (params.recurrence_type === "monthly") {
						recurrenceRule.monthlyFrequency = params.recurrence_frequency;
					}
				}

				// Set days for weekly recurrence
				if (
					params.recurrence_type === "weekly" &&
					params.weekly_days &&
					params.weekly_days.length > 0
				) {
					for (const day of params.weekly_days) {
						const dayKey = day.toLowerCase() as keyof RecurrenceRule;
						if (
							[
								"sunday",
								"monday",
								"tuesday",
								"wednesday",
								"thursday",
								"friday",
								"saturday",
							].includes(dayKey)
						) {
							// Type assertion needed because TypeScript can't infer the exact property names
							switch (dayKey) {
								case "sunday":
									recurrenceRule.sunday = true;
									break;
								case "monday":
									recurrenceRule.monday = true;
									break;
								case "tuesday":
									recurrenceRule.tuesday = true;
									break;
								case "wednesday":
									recurrenceRule.wednesday = true;
									break;
								case "thursday":
									recurrenceRule.thursday = true;
									break;
								case "friday":
									recurrenceRule.friday = true;
									break;
								case "saturday":
									recurrenceRule.saturday = true;
									break;
							}
						}
					}
				}

				// Set day for monthly recurrence
				if (params.recurrence_type === "monthly" && params.monthly_day) {
					recurrenceRule.dayOfMonth = params.monthly_day;
				}

				// Set month and day for yearly recurrence
				if (params.recurrence_type === "yearly") {
					if (params.yearly_month) recurrenceRule.month = params.yearly_month;
					if (params.yearly_day) recurrenceRule.dayOfMonthYear = params.yearly_day;
				}

				taskData.recurrence_rule = recurrenceRule;
			}

			// Create the task
			const response = await this.client.createTask(taskData);
			const task = response.data;

			// Format the response
			const status = task.attributes.done ? "✅ Done" : "⏳ Pending";
			const dueDate = task.attributes.due_date
				? new Date(task.attributes.due_date).toLocaleString()
				: "No due date";

			const tags =
				task.attributes.tags && task.attributes.tags.length > 0
					? task.attributes.tags.map((tag: { name: string }) => `#${tag.name}`).join(", ")
					: "No tags";

			const successMessage = `✅ Task created successfully!\n\n📝 ${task.attributes.name} (${task.attributes.priority})\n  • Status: ${status}\n  • Due: ${dueDate}\n  • ID: ${task.id}\n  • Description: ${task.attributes.description || "None"}\n  • Tags: ${tags}`;

			return {
				content: [{ type: "text", text: successMessage }],
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			console.error("Error creating task:", error);
			return {
				content: [{ type: "text", text: `❌ Failed to create task: ${errorMessage}` }],
			};
		}
	}
}
