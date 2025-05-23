import type { LawmaticsClientWrapper } from "@/client/lawmatics";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BaseTools } from "./base";

export class StageTools extends BaseTools {
	static create(client: LawmaticsClientWrapper, server: McpServer) {
		const tools = new StageTools(client);

		server.tool(
			"get_document",
			"Get a document by ID",
			{ documentId: z.string().describe("The ID of the stage to get") },
			async ({ documentId }) => await tools.getDocument(documentId),
		);

		server.tool(
			"list_stages",
			"List all available pipeline stages",
			{},
			async () => await tools.getStages(),
		);
		return tools;
	}

	async getDocument(documentId: string): Promise<CallToolResult> {
		const response = await this.client.getDocumentMetaData(documentId);
		const document = response?.data;

		if (!document) throw new Error(`Failed to retrieve Document with ID: ${documentId}`);

		return this.toResult(JSON.stringify(response, null, 2));
	}

	async getDocuments(prospectId: string): Promise<CallToolResult> {
		const response = await this.client.getDocuments(prospectId);
		const documents = response?.data;

		if (!documents || !Array.isArray(documents)) {
			throw new Error(`Failed to fetch documents for ${prospectId}`);
		}

		if (documents.length === 0) {
			return this.toResult("No documents found.");
		}

		const documentsList = documents
			.map((stage) => {
        return JSON.stringify(documents, null, 2);

				return `Stage ID: ${stage.id}
    Name: ${stage?.attributes?.name}
    Color: ${stage?.attributes?.color}
    Order: ${stage?.attributes?.order}`;
			})
			.join("\n\n");

		return this.toResult(`Available Documents (${documents.length}):

${documentsList}`);
	}
	async downloadDocument(): Promise<CallToolResult> {
    // hello
		return this.toResult("....")
	}
}
