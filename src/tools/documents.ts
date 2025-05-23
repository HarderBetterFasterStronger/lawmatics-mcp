import type { Document, LawmaticsClientWrapper } from "@/client/lawmatics";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BaseTools } from "./base";

export class DocumentTools extends BaseTools {
	static create(client: LawmaticsClientWrapper, server: McpServer) {
		const tools = new DocumentTools(client);

		server.tool(
			"get_document",
			"Get a document by ID",
			{ documentId: z.string().describe("The ID of the document to get") },
			async ({ documentId }) => await tools.getDocument(documentId),
		);

		server.tool(
			"list_documents",
			"List available documents for matter",
			{ prospectId: z.string().describe("The ID of the prospect to get documents for") },
			async ({ prospectId }) => await tools.getDocuments(prospectId),
		);
		server.tool(
			"download_document",
			"Base64 Encoded version of focument",
			{ documentId: z.string().describe("The ID of the documents") },
			async ({ documentId }) => await tools.downloadDocument(documentId),
		);

		return tools;
	}

	async getDocument(documentId: string): Promise<CallToolResult> {
		const response = await this.client.getDocumentMetaData(documentId);
		const document = response?.data;

		if (!document) throw new Error(`Failed to retrieve Document with ID: ${documentId}`);

		return this.toResult(this.formatDocument(document));
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

		return this.toResult(this.formatDocumentList(documents));
	}

  async downloadDocument(documentId: string): Promise<CallToolResult> {
		const response = await this.client.getDocuments(documentId);
		return this.toResult(JSON.stringify(response));
	}

  private formatDocument(document: Document){
    return `${document.attributes.name} (${document.attributes.file_type})`
  }

  private formatDocumentList(documents: Document[]){
    const doucmentList = documents.map(doc => `* ${this.formatDocument(doc)}`).join("\n")

    return `Available Documents:\n\n${doucmentList}\n`
  }
}
