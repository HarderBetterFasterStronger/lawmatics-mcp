import type { LawmaticsClientWrapper } from "@/client/lawmatics";
import type { Prospect } from "@/client/lawmatics";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BaseTools } from "./base";

// Define a type for unknown properties that could be any value
type UnknownValue = string | number | boolean | object | null | undefined;

export class ProspectTools extends BaseTools {
	static create(client: LawmaticsClientWrapper, server: McpServer) {
		const tools = new ProspectTools(client);

		server.tool(
			"get_prospect",
			"Get a Lawmatics prospect by ID",
			{ prospectId: z.string().describe("The ID of the prospect to get") },
			async ({ prospectId }) => await tools.getProspect(prospectId),
		);

		server.tool(
			"list_prospects_with_optional_filtering",
			"List Lawmatics prospects with optional filtering",
			{
				fields: z
					.string()
					.optional()
					.describe("Comma-separated list of fields to include or 'all' for all fields"),
			},
			async (params) => await tools.listProspects(params),
		);

		server.tool(
			"create_prospect",
			"Create a new Lawmatics prospect",
			{
				firstName: z.string().describe("First name of the prospect"),
				lastName: z.string().describe("Last name of the prospect"),
				email: z.string().describe("Email address of the prospect"),
				phone: z.string().optional().describe("Phone number of the prospect"),
				notes: z.string().optional().describe("Additional notes about the prospect"),
			},
			async (params) => await tools.createProspect(params),
		);

		server.tool(
			"update_prospect",
			"Update an existing Lawmatics prospect",
			{
				prospectId: z.string().describe("The ID of the prospect to update"),
				firstName: z.string().optional().describe("First name of the prospect"),
				lastName: z.string().optional().describe("Last name of the prospect"),
				email: z.string().optional().describe("Email address of the prospect"),
				phone: z.string().optional().describe("Phone number of the prospect"),
				notes: z.string().optional().describe("Additional notes about the prospect"),
			},
			async (params) => await tools.updateProspect(params),
		);

		server.tool(
			"search_prospects",
			"Search for Lawmatics prospects",
			{
				query: z.string().describe("Search query to find matching prospects"),
			},
			async ({ query }) => await tools.searchProspects(query),
		);

		server.tool(
			"find_prospect_by_name",
			"Find a Lawmatics prospect by name (fuzzy search)",
			{
				name: z.string().describe("Name to search for (first name, last name, or both)"),
			},
			async ({ name }) => await tools.findProspectByName(name),
		);

		return tools;
	}

	async listProspects(params: { fields?: string }) {
		const response = await this.client.getProspects({
			fields: params.fields || "all",
		});

		const prospects = response?.data;
		const total = response?.meta?.total || 0;

		if (!prospects || !Array.isArray(prospects)) {
			throw new Error("Failed to fetch prospects");
		}

		if (prospects.length === 0) {
			return this.toResult("No prospects found.");
		}

		return this.toResult(`Result (${prospects.length} prospects found${total > prospects.length ? ` of ${total} total` : ""}):
${this.formatAsProspectList(prospects)}`);
	}

	async getProspect(prospectId: string) {
		const response = await this.client.getProspect(prospectId);
		const prospect = response?.data;

		if (!prospect) throw new Error(`Failed to retrieve Lawmatics prospect with ID: ${prospectId}`);

		return this.toResult(`Prospect: ${prospectId}
${response.data.url ? `URL: ${response.data.url}\n` : ""}
Name: ${prospect?.attributes?.first_name} ${prospect?.attributes?.last_name}
Email: ${prospect?.attributes?.email || "[Not set]"}
Phone: ${prospect?.attributes?.phone || "[Not set]"}
Created: ${new Date(prospect?.attributes?.created_at || "").toLocaleString()}
Updated: ${new Date(prospect?.attributes?.updated_at || "").toLocaleString()}

${prospect?.attributes?.notes ? `Notes:\n${prospect?.attributes?.notes}` : "[No notes]"}`);
	}

	async createProspect({
		firstName,
		lastName,
		email,
		phone,
		notes,
	}: {
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		notes?: string;
	}): Promise<CallToolResult> {
		const prospectData = {
			first_name: firstName,
			last_name: lastName,
			email,
			...(phone ? { phone } : {}),
			...(notes ? { notes } : {}),
		};

		const response = await this.client.createProspect(prospectData);
		const prospect = response?.data;

		if (!prospect) throw new Error("Failed to create prospect");

		return this.toResult(`Prospect created with ID: ${prospect.id}.`);
	}

	async updateProspect({
		prospectId,
		firstName,
		lastName,
		email,
		phone,
		notes,
	}: {
		prospectId: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
		notes?: string;
	}): Promise<CallToolResult> {
		const updateData: Record<string, UnknownValue> = {};
		if (firstName) updateData.first_name = firstName;
		if (lastName) updateData.last_name = lastName;
		if (email) updateData.email = email;
		if (phone) updateData.phone = phone;
		if (notes) updateData.notes = notes;

		const response = await this.client.updateProspect(prospectId, updateData);
		const prospect = response?.data;

		if (!prospect) throw new Error(`Failed to update prospect with ID: ${prospectId}`);

		return this.toResult(`Prospect with ID ${prospectId} updated successfully.`);
	}

	async searchProspects(query: string) {
		const response = await this.client.searchProspects(query);
		const prospects = response?.data;
		const total = response?.meta?.total || 0;

		if (!prospects || !Array.isArray(prospects)) {
			throw new Error(`Failed to search for prospects matching your query: "${query}"`);
		}

		if (prospects.length === 0) {
			return this.toResult(`Result: No prospects found.`);
		}

		return this.toResult(`Result (first ${prospects.length} shown of ${total} total prospects found matching "${query}"):
${this.formatAsProspectList(prospects)}`);
	}

	async findProspectByName(name: string) {
		try {
			// Note: You need to add the findProspectByName method to the LawmaticsClientWrapper class
			// Add this method to src/client/lawmatics.ts:
			/*
			 * async findProspectByName(name: string) {
			 *   const encodedName = encodeURIComponent(name);
			 *   const url = `${this.baseUrl}/v1/prospects/find_by_name/${encodedName}`;
			 *
			 *   const response = await this.makeRequest({
			 *     method: 'GET',
			 *     url,
			 *   });
			 *
			 *   return response;
			 * }
			 */
			const response = await this.client.findProspectByName(name);
			const prospect = response?.data;

			if (!prospect) {
				return this.toResult(`No prospect found matching the name: "${name}".`);
			}

			return this.toResult(`Prospect found matching name "${name}":

ID: ${prospect.id}
Name: ${prospect?.attributes?.first_name} ${prospect?.attributes?.last_name}
Email: ${prospect?.attributes?.email || "[Not set]"}
Phone: ${prospect?.attributes?.phone || "[Not set]"}
Created: ${new Date(prospect?.attributes?.created_at || "").toLocaleString()}
Updated: ${new Date(prospect?.attributes?.updated_at || "").toLocaleString()}

${prospect?.attributes?.notes ? `Notes:\n${prospect?.attributes?.notes}` : "[No notes]"}`);
		} catch (error) {
			throw new Error(
				`Failed to find prospect by name: "${name}". ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private formatAsProspectList(prospects: Prospect[]): string {
		return prospects
			.map((prospect) => {
				const attrs = prospect.attributes || {};
				const firstName = attrs.first_name || "";
				const lastName = attrs.last_name || "";
				const email = attrs.email_address || attrs.email || "No email";
				return `- ${prospect.id}: ${firstName} ${lastName} (${email})`;
			})
			.join("\n");
	}
}
