import type { LawmaticsClientWrapper, TimelineActivity } from "@/client/lawmatics";
import type { Prospect } from "@/client/lawmatics";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BaseTools } from "./base";
import { formatProspectDetails } from "./prospect-formatter";

// Define a type for unknown properties that could be any value
type UnknownValue = string | number | boolean | object | null | undefined;

export class ProspectTools extends BaseTools {
	static create(client: LawmaticsClientWrapper, server: McpServer) {
		const tools = new ProspectTools(client); // TODO revisit this

		server.tool(
			"get_prospect",
			"Get a Lawmatics matter / prospect by ID",
			{
				prospectId: z.string().describe("The ID of the matter/prospect as a string of digits"),
			},
			async ({ prospectId }) => await tools.getProspect(prospectId),
		);

		server.tool(
			"create_prospect",
			"Create a new Lawmatics matter / prospect",
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
			"Update an existing Lawmatics matter / prospect",
			{
				prospectId: z.string().describe("The ID of the matter / prospect to update"),
				firstName: z.string().optional().describe("First name of the prospect"),
				lastName: z.string().optional().describe("Last name of the prospect"),
				email: z.string().optional().describe("Email address of the prospect"),
				phone: z.string().optional().describe("Phone number of the prospect"),
				notes: z.string().optional().describe("Additional notes about the prospect"),
				stage: z.string().optional().describe("ID of the stage to assign the prospect to"),
			},
			async (params) => await tools.updateProspect(params),
		);

		server.tool(
			"search_prospects",
			"Search for Lawmatics matters / prospects with pagination support",
			{
				query: z.string().describe("Search query to find matching prospects"),
			},
			async ({ query }) => await tools.searchProspects(query),
		);

		server.tool(
			"find_prospect_by_name",
			"Find a Lawmatics matter / prospect by name (fuzzy search)",
			{
				name: z.string().describe("Name to search for (first name, last name, or both)"),
			},
			async ({ name }) => await tools.findProspectByName(name),
		);

		server.tool(
			"find_prospect_by_email",
			"Find a Lawmatics matter / prospect by email address (fuzzy search)",
			{
				email: z.string().describe("Email address to search for"),
			},
			async ({ email }) => await tools.findProspectByEmail(email),
		);

		server.tool(
			"find_prospect_by_phone",
			"Find a Lawmatics matter / prospect by phone number (fuzzy search)",
			{
				phone: z.string().describe("Phone number to search for"),
			},
			async ({ phone }) => await tools.findProspectByPhone(phone),
		);

		server.tool(
			"get_timeline_activities_for_prospect",
			"Find recent activities for a Lawmatics prospect",
			{
				matterId: z.string().describe("Prospect id to search for"),
			},
			async ({ matterId }) => await tools.findTimelineActivitiesForProspect(matterId),
		);

		server.tool(
			"find_prospect_by_case_title",
			"Find Lawmatics matters / prospects by case title",
			{
				caseTitle: z.string().describe("Case title to search for"),
			},
			async ({ caseTitle }) => await tools.findProspectByCaseTitle(caseTitle),
		);

		return tools;
	}

	async getProspect(prospectId: string) {
		const response = await this.client.getProspect(prospectId);
		const prospect = response?.data;

		if (!prospect)
			throw new Error(`Failed to retrieve Lawmatics matter / prospect with ID: ${prospectId}`);

		const formattedOutput = formatProspectDetails(prospect);
		return this.toResult(formattedOutput);
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

		if (!prospect) throw new Error("Failed to create matter / prospect");

		return this.toResult(`Matter / Prospect created with ID: ${prospect.id}.`);
	}

	async updateProspect({
		prospectId,
		firstName,
		lastName,
		email,
		phone,
		notes,
		stage,
	}: {
		prospectId: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
		notes?: string;
		stage?: string;
	}): Promise<CallToolResult> {
		const updateData: Record<string, UnknownValue> = {};
		if (firstName) updateData.first_name = firstName;
		if (lastName) updateData.last_name = lastName;
		if (email) updateData.email = email;
		if (phone) updateData.phone = phone;
		if (notes) updateData.notes = notes;
		if (stage) updateData.stage = stage;

		const response = await this.client.updateProspect(prospectId, updateData);
		const prospect = response?.data;

		if (!prospect) throw new Error(`Failed to update matter / prospect with ID: ${prospectId}`);

		return this.toResult(`Matter / Prospect with ID ${prospectId} updated successfully.`);
	}

	async searchProspects(query: string) {
		const response = await this.client.searchProspects(query);

		const { prospects, pagination } = response;
		const { totalEntries, tooManyResults } = pagination;

		if (!prospects || !Array.isArray(prospects)) {
			throw new Error(`Failed to search for matters / prospects matching your query: "${query}"`);
		}

		if (prospects.length === 0) {
			return this.toResult(`Result: No matters / prospects found.`);
		}

		let resultMessage = `Result (${prospects.length} shown of ${totalEntries} total matters / prospects found matching "${query}")`;

		if (tooManyResults) {
			resultMessage += `\nToo many results found. Only showing first ${prospects.length} results. Please refine your search query. You can always search using the find matter / prospect by email or find matter / prospect by phone number tool for better accuracy.`;
		}

		return this.toResult(
			`${resultMessage}\n${this.formatAsProspectList(prospects, { truncate: true })}`,
		);
	}

	async findProspectByName(name: string) {
		try {
			const response = await this.client.findProspectByName(name);
			const prospect = response?.data;

			if (!prospect) {
				return this.toResult(`No matter / prospect found matching the name: "${name}".`);
			}

			const formattedOutput = formatProspectDetails(prospect);
			return this.toResult(
				`Matter / Prospect found matching name "${name}":\n\n${formattedOutput}`,
			);
		} catch (error) {
			throw new Error(
				`Failed to find matter / prospect by name: "${name}". ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async findProspectByEmail(email: string) {
		try {
			const response = await this.client.findProspectByEmail(email);
			const prospect = response?.data;

			if (!prospect) {
				return this.toResult(`No matter / prospect found matching the email address: "${email}".`);
			}

			const formattedOutput = formatProspectDetails(prospect);
			return this.toResult(
				`Matter / Prospect found matching email address "${email}":\n\n${formattedOutput}`,
			);
		} catch (error) {
			throw new Error(
				`Failed to find matter / prospect by email: "${email}". ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async findTimelineActivitiesForProspect(matterId: string) {
		try {
			const response = await this.client.findTimelineActivitiesForProspect(matterId);
			const activities = response?.data;

			if (!activities) {
				return this.toResult(`No activities were found for prospect with id: "${matterId}".`);
			}

			return this.toResult(this.formatTimelineActivitiesList(activities));
		} catch (error) {
			console.error(error);
			throw new Error(
				`Failed to find timeline activities: "${matterId}". ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private formatTimelineActivitiesList(activities: TimelineActivity[]) {
		return activities
			.map((actvivity) => {
				const title = actvivity.attributes.key.replace(".", " ");
				const details = JSON.stringify(actvivity.attributes.detail_keys, null, 2);

				return `Activity:${title}

Details:
${details}`;
			})
			.join("\n\n");
	}

	async findProspectByPhone(phone: string) {
		try {
			const response = await this.client.findProspectByPhone(phone);
			const prospect = response?.data;

			if (!prospect) {
				return this.toResult(`No matter / prospect found matching the phone number: "${phone}".`);
			}

			const formattedOutput = formatProspectDetails(prospect);
			return this.toResult(
				`Matter / Prospect found matching phone number "${phone}":\n\n${formattedOutput}`,
			);
		} catch (error) {
			throw new Error(
				`Failed to find matter / prospect by phone: "${phone}". ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async findProspectByCaseTitle(caseTitle: string) {
		try {
			const response = await this.client.findProspectByCaseTitle(caseTitle);
			const prospects = response?.data;

			if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
				return this.toResult(`No matters / prospects found matching case title: "${caseTitle}".`);
			}

			const totalFound = prospects.length;
			const resultMessage = `Found ${totalFound} matter${totalFound !== 1 ? "s" : ""} / prospect${totalFound !== 1 ? "s" : ""} matching case title "${caseTitle}":`;

			return this.toResult(`${resultMessage}\n${this.formatAsProspectList(prospects)}`);
		} catch (error) {
			throw new Error(
				`Failed to find matters / prospects by case title: "${caseTitle}". ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
	private formatAsProspectList(
		prospects: Prospect[],
		options: { truncate?: boolean } = {},
	): string {
		if (prospects.length === 0) {
			return "No prospects found.";
		}

		return prospects
			.map((prospect) => {
				const fullDetails = formatProspectDetails(prospect);
				return `---\n${options?.truncate ? fullDetails.split("\n").slice(0, 10).join("\n") : fullDetails}\n---`;
			})
			.join("\n\n");
	}
}
