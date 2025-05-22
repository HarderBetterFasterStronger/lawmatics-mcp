import type { LawmaticsClientWrapper } from "@/client/lawmatics";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BaseTools } from "./base";

export class PracticeAreaTools extends BaseTools {
	static create(client: LawmaticsClientWrapper, server: McpServer) {
		const tools = new PracticeAreaTools(client);

		server.tool(
			"list_practice_areas",
			"List all practice areas with pagination support",
			{
				page: z.number().int().positive().optional().default(1).describe("Page number (1-based)"),
				perPage: z
					.number()
					.int()
					.positive()
					.max(100)
					.optional()
					.default(25)
					.describe("Number of items per page (max 100)"),
			},
			async (params) => await tools.listPracticeAreas(params.page, params.perPage),
		);

		server.tool(
			"get_practice_area",
			"Get a specific practice area by ID",
			{
				practiceAreaId: z.string().describe("The ID of the practice area to retrieve"),
			},
			async ({ practiceAreaId }) => await tools.getPracticeArea(practiceAreaId),
		);

		return tools;
	}

	async listPracticeAreas(page = 1, perPage = 25): Promise<CallToolResult> {
		const response = await this.client.getPracticeAreas(page, perPage);
		const practiceAreas = response?.data;
		const meta = response?.meta;

		if (!practiceAreas || !Array.isArray(practiceAreas)) {
			throw new Error("Failed to fetch practice areas");
		}

		if (practiceAreas.length === 0) {
			return this.toResult("No practice areas found.");
		}

		const total = meta?.total_entries || practiceAreas.length;
		const totalPages = meta?.total_pages || Math.ceil(total / perPage);

		const practiceAreasList = practiceAreas
			.map(
				(area) =>
					`${area.attributes.name} (ID: ${area.id})\n` +
					`  • Color: ${area.attributes.color}\n` +
					`  • Created: ${new Date(area.attributes.created_at).toLocaleDateString()}\n` +
					`  • Updated: ${new Date(area.attributes.updated_at).toLocaleDateString()}`,
			)
			.join("\n\n");

		return this.toResult(
			`Practice Areas (Page ${page} of ${totalPages}, Showing ${practiceAreas.length} of ${total} total):\n\n${practiceAreasList}`,
		);
	}

	async getPracticeArea(practiceAreaId: string): Promise<CallToolResult> {
		const response = await this.client.getPracticeArea(practiceAreaId);
		const practiceArea = response?.data;

		if (!practiceArea) {
			throw new Error(`Failed to retrieve practice area with ID: ${practiceAreaId}`);
		}

		return this.toResult(
			`Practice Area: ${practiceArea.attributes.name} (ID: ${practiceArea.id})\n` +
				`• Color: ${practiceArea.attributes.color}\n` +
				`• Created: ${new Date(practiceArea.attributes.created_at).toLocaleString()}\n` +
				`• Updated: ${new Date(practiceArea.attributes.updated_at).toLocaleString()}`,
		);
	}
}
