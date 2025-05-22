import type { LawmaticsClientWrapper } from "@/client/lawmatics";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BaseTools } from "./base";

export class StageTools extends BaseTools {
	static create(client: LawmaticsClientWrapper, server: McpServer) {
		const tools = new StageTools(client);

		server.tool(
			"get_stage",
			"Get a pipeline stage by ID",
			{ stageId: z.string().describe("The ID of the stage to get") },
			async ({ stageId }) => await tools.getStage(stageId),
		);
		return tools;
	}

	async getStage(stageId: string): Promise<CallToolResult> {
		const response = await this.client.getStage(stageId);
		const stage = response?.data;

		if (!stage) throw new Error(`Failed to retrieve Lawmatics stage with ID: ${stageId}`);

		return this.toResult(`Stage: ${stageId}
    Name: ${stage?.attributes?.name}
    Created: ${new Date(stage?.attributes?.created_at || "").toLocaleString()}
    Updated: ${new Date(stage?.attributes?.updated_at || "").toLocaleString()}
    Color: ${stage?.attributes?.color}
    Order: ${stage?.attributes?.order}`);
	}
}
