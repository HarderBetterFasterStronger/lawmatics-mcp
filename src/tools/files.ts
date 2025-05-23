import * as fs from "node:fs";
import * as nodePath from "node:path";
import type { LawmaticsClientWrapper } from "@/client/lawmatics";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BaseTools } from "./base";

// File response type definitions for Lawmatics API
interface LawmaticsFileResponse {
	data: {
		attributes?: {
			file_url?: string;
		};
	};
}

export class FileTools extends BaseTools {
	static create(client: LawmaticsClientWrapper, server: McpServer) {
		const tools = new FileTools(client);

		server.tool(
			"upload_file",
			"Upload a file to Lawmatics",
			{
				filePath: z.string().describe("The local path to the file to upload"),
				documentableType: z
					.enum(["firm", "client", "matter", "contact"])
					.default("firm")
					.describe(
						'The type of entity to attach the file to (defaults to "firm" if not specified)',
					),
				documentableId: z
					.string()
					.optional()
					.describe("The ID of the entity to attach the file to (not required for firm)"),
				name: z.string().optional().describe("Optional custom name for the file"),
				folderId: z.string().optional().describe("Optional folder ID to place the file in"),
				folderPath: z
					.array(z.string())
					.optional()
					.describe(
						'Optional path array (e.g. ["Root", "Folder 1"]) - will create folders if needed. Overrides folderId.',
					),
			},
			async (params) => await tools.uploadFile(params),
		);

		return tools;
	}

	async uploadFile(params: {
		filePath: string;
		documentableType?: "firm" | "client" | "matter" | "contact";
		documentableId?: string;
		name?: string;
		folderId?: string;
		folderPath?: string[];
	}): Promise<CallToolResult> {
		const { filePath, name, folderId, folderPath } = params;
		const documentableType = params.documentableType || "firm";
		const documentableId = params.documentableId;

		// Validate that the file exists
		if (!fs.existsSync(filePath)) {
			throw new Error(`File not found at path: ${filePath}`);
		}

		// Validate that documentableId is provided if documentableType is not "firm"
		if (documentableType !== "firm" && !documentableId) {
			throw new Error(`documentableId is required when documentableType is ${documentableType}`);
		}

		// Read the file
		const fileBuffer = fs.readFileSync(filePath);
		const fileName = name || nodePath.basename(filePath);

		try {
			// Call client's uploadFile method
			const response = await this.client.uploadFile(
				fileBuffer,
				fileName,
				documentableType,
				documentableId,
				{ name, folderId, path: folderPath },
			);

			// Extract file_url from the nested response structure using proper typing
			const fileUrl =
				(response as unknown as LawmaticsFileResponse)?.data?.attributes?.file_url ||
				"No direct file URL available";
			return this.toResult(`File uploaded successfully.

File URL: ${fileUrl}

Details:
${JSON.stringify(response, null, 2)}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Failed to upload file: ${errorMessage}`);
		}
	}
}
