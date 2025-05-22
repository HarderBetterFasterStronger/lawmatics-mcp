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
			"Get a Lawmatics matter / prospect by ID",
			{
				prospectId: z.string().describe("The ID of the matter / prospect to get"),
				fields: z
					.string()
					.optional()
					.describe(
						"Comma-separated list of fields to include or 'all' for all fields, defaults to 'all' if not provided",
					),
			},
			async ({ prospectId, fields }) => await tools.getProspect(prospectId, fields),
		);

		server.tool(
			"list_prospects_with_optional_filtering",
			"List Lawmatics matters / prospects with optional filtering",
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
			},
			async (params) => await tools.updateProspect(params),
		);

		server.tool(
			"search_prospects",
			"Search for Lawmatics matters / prospects",
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
			"find_prospect_by_phone",
			"Find a Lawmatics matter / prospect by phone number (fuzzy search)",
			{
				phone: z.string().describe("Phone number to search for"),
			},
			async ({ phone }) => await tools.findProspectByPhone(phone),
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
			throw new Error("Failed to fetch matters / prospects");
		}

		if (prospects.length === 0) {
			return this.toResult("No matters / prospects found.");
		}

		return this.toResult(`Result (${prospects.length} matters / prospects found${total > prospects.length ? ` of ${total} total` : ""}):
${this.formatAsProspectList(prospects)}`);
	}

	async getProspect(prospectId: string, fields?: string) {
		const response = await this.client.getProspect(prospectId, fields);
		const prospect = response?.data;

		if (!prospect)
			throw new Error(`Failed to retrieve Lawmatics matter / prospect with ID: ${prospectId}`);

		const attrs = prospect.attributes || {};
		const relationships = prospect.relationships || {};

		// Format custom fields if they exist
		let customFieldsText = "";
		if (attrs.custom_fields && attrs.custom_fields.length > 0) {
			customFieldsText = `\nCustom Fields:\n${attrs.custom_fields.map((field) => `- ${field.name}: ${field.formatted_value || field.value || "[Not set]"}`).join("\n")}`;
		}

		// Format relationships information
		let relationshipsText = "\nRelationships:";

		// Creator information
		if (relationships.created_by?.data) {
			relationshipsText += `\n- Created By: User ID ${relationships.created_by.data.id} (${relationships.created_by.data.type})`;
		}

		// Contact information
		if (relationships.contact?.data) {
			relationshipsText += `\n- Contact: ID ${relationships.contact.data.id} (${relationships.contact.data.type})`;
		}

		// Company information
		if (relationships.company?.data) {
			relationshipsText += `\n- Company: ID ${relationships.company.data.id} (${relationships.company.data.type})`;
		}

		// Source information
		if (relationships.source?.data) {
			relationshipsText += `\n- Source: ${relationships.source.data.id} (${relationships.source.data.type})`;
		}

		// Campaign information
		if (relationships.campaign?.data) {
			relationshipsText += `\n- Campaign: ${relationships.campaign.data.id} (${relationships.campaign.data.type})`;
		}

		// Practice area information
		if (relationships.practice_area?.data) {
			relationshipsText += `\n- Practice Area: ${relationships.practice_area.data.id} (${relationships.practice_area.data.type})`;
		}

		// Ownership information
		if (relationships.owned_by?.data) {
			relationshipsText += `\n- Owned By: ID ${relationships.owned_by.data.id} (${relationships.owned_by.data.type})`;
		}

		// Email addresses
		if (relationships.emails?.data && relationships.emails.data.length > 0) {
			relationshipsText += `\n- Email Addresses (${relationships.emails.data.length}):`;
			relationships.emails.data.forEach((email, index) => {
				relationshipsText += `\n  * Email ${index + 1}: ID ${email.id} (${email.type})`;
			});
		}

		// Phone numbers
		if (relationships.phone_numbers?.data && relationships.phone_numbers.data.length > 0) {
			relationshipsText += `\n- Phone Numbers (${relationships.phone_numbers.data.length}):`;
			relationships.phone_numbers.data.forEach((phone, index) => {
				relationshipsText += `\n  * Phone ${index + 1}: ID ${phone.id} (${phone.type})`;
			});
		}

		// Assigned staff information
		if (relationships.assigned_staff?.data && relationships.assigned_staff.data.length > 0) {
			relationshipsText += `\n- Assigned Staff (${relationships.assigned_staff.data.length}):`;
			relationships.assigned_staff.data.forEach((staff, index) => {
				relationshipsText += `\n  * Staff ${index + 1}: ID ${staff.id} (${staff.type})`;
			});
		}

		// Attorney information
		if (relationships.lead_attorney?.data) {
			relationshipsText += `\n- Lead Attorney: ${relationships.lead_attorney.data.id} (${relationships.lead_attorney.data.type})`;
		}

		if (relationships.originating_attorney?.data) {
			relationshipsText += `\n- Originating Attorney: ${relationships.originating_attorney.data.id} (${relationships.originating_attorney.data.type})`;
		}

		if (relationships.salesperson?.data) {
			relationshipsText += `\n- Salesperson: ${relationships.salesperson.data.id} (${relationships.salesperson.data.type})`;
		}

		// Related files, documents, events, tasks, and more
		const countRelated = (key: string) => {
			const relation = relationships[key];
			if (
				relation &&
				typeof relation === "object" &&
				"data" in relation &&
				Array.isArray(relation.data)
			) {
				return relation.data.length;
			}
			return 0;
		};

		// Count all related items
		const fileCount = countRelated("files");
		const docCount = countRelated("documents");
		const eventCount = countRelated("events");
		const taskCount = countRelated("tasks");
		const noteCount = countRelated("notes");
		const addressCount = countRelated("addresses");
		const invoiceCount = countRelated("invoices");
		const tagCount = countRelated("tags");
		const folderCount = countRelated("folders");
		const fileRequestCount = countRelated("file_requests");

		// Display related items counts
		relationshipsText += "\n\nRelated Items:";
		relationshipsText += `\n  - Files: ${fileCount}`;
		relationshipsText += `\n  - Documents: ${docCount}`;
		relationshipsText += `\n  - Folders: ${folderCount}`;
		relationshipsText += `\n  - Events: ${eventCount}`;
		relationshipsText += `\n  - Tasks: ${taskCount}`;
		relationshipsText += `\n  - Notes: ${noteCount}`;
		relationshipsText += `\n  - Addresses: ${addressCount}`;
		relationshipsText += `\n  - Invoices: ${invoiceCount}`;
		relationshipsText += `\n  - Tags: ${tagCount}`;
		relationshipsText += `\n  - File Requests: ${fileRequestCount}`;

		// Show detailed task information
		if (relationships.tasks?.data && relationships.tasks.data.length > 0) {
			relationshipsText += `\n\nTasks (${relationships.tasks.data.length}):`;
			relationships.tasks.data.forEach((task, index) => {
				relationshipsText += `\n  ${index + 1}. Task ID: ${task.id} (${task.type})`;
			});
		}

		// Show detailed file information
		if (relationships.files?.data && relationships.files.data.length > 0) {
			relationshipsText += `\n\nFiles (${relationships.files.data.length}):`;
			relationships.files.data.forEach((file, index) => {
				relationshipsText += `\n  ${index + 1}. File ID: ${file.id} (${file.type})`;
			});
		}

		// Show detailed document information
		if (relationships.documents?.data && relationships.documents.data.length > 0) {
			relationshipsText += `\n\nDocuments (${relationships.documents.data.length}):`;
			relationships.documents.data.forEach((doc, index) => {
				relationshipsText += `\n  ${index + 1}. Document ID: ${doc.id} (${doc.type})`;
			});
		}

		// Format related notes if they exist
		let relatedNotesText = "";
		if (relationships.notes?.data && relationships.notes.data.length > 0) {
			let notesList = `- ${relationships.notes.data.length} note(s) attached to this prospect`;
			relationships.notes.data.forEach((note, index) => {
				notesList += `\n  ${index + 1}. Note ID: ${note.id} (Type: ${note.type})`;
			});
			relatedNotesText = `\nRelated Notes:\n${notesList}`;
		}

		// Get stage information if available
		let stageInfo = "";
		if (relationships.stage?.data?.id) {
			try {
				const stageResponse = await this.client.getStage(relationships.stage.data.id);
				const stage = stageResponse?.data;
				if (stage?.attributes) {
					stageInfo = `\nStage: ${stage.attributes.name} (#${stage.attributes.color})`;
				}
			} catch (error) {
				stageInfo = `\nStage ID: ${relationships.stage.data.id} (details not available)`;
			}
		}

		// Format address if available
		let addressInfo = "";
		if (attrs.full_address) {
			addressInfo = `\nAddress: ${attrs.full_address}`;
		} else if (attrs.city || attrs.state || attrs.zipcode) {
			addressInfo = `\nAddress: ${[attrs.street, attrs.street2].filter(Boolean).join(", ")}\n${attrs.city_state_zip || [attrs.city, attrs.state, attrs.zipcode].filter(Boolean).join(", ")}${attrs.country ? `, ${attrs.country}` : ""}`;
		}
		// Format case information if available
		let caseInfo = "";
		if (attrs.case_title) {
			caseInfo += `\nCase Title: ${attrs.case_title}`;
		}
		if (attrs.case_blurb) {
			caseInfo += `\nCase Description: ${attrs.case_blurb}`;
		}
		if (attrs.case_number) {
			caseInfo += `\nCase Number: #${attrs.case_number}`;
		}

		// Format status information
		let statusInfo = "";
		if (attrs.status || attrs.sub_status) {
			statusInfo = `\nStatus: ${attrs.status || ""} ${attrs.sub_status ? `(${attrs.sub_status})` : ""}`;
		}

		// Format financial information if available
		let financialInfo = "";
		if (attrs.estimated_value_cents || attrs.actual_value_cents || attrs.lead_cost_cents) {
			financialInfo = "\nFinancial:";
			if (attrs.estimated_value_cents)
				financialInfo += `\n- Estimated Value: $${(attrs.estimated_value_cents / 100).toFixed(2)}`;
			if (attrs.actual_value_cents)
				financialInfo += `\n- Actual Value: $${(attrs.actual_value_cents / 100).toFixed(2)}`;
			if (attrs.lead_cost_cents)
				financialInfo += `\n- Lead Cost: $${(attrs.lead_cost_cents / 100).toFixed(2)}`;
		}

		// Format contact information
		const contactInfo = `Contact Name: ${attrs.first_name || ""} ${attrs.last_name || ""}${attrs.name_suffix ? ` ${attrs.name_suffix}` : ""}\nEmail: ${attrs.email || attrs.email_address || "[Not set]"}\nPhone: ${attrs.phone || attrs.phone_number || "[Not set]"}`;

		// Format date information
		let dateInfo = `Created: ${new Date(attrs.created_at || "").toLocaleString()}\nUpdated: ${new Date(attrs.updated_at || "").toLocaleString()}`;
		if (attrs.date_of_last_contact) {
			dateInfo += `\nLast Contact: ${new Date(attrs.date_of_last_contact).toLocaleString()} (${attrs.days_since_last_contact} days ago)`;
		}

		// Format UTM information if available
		let utmInfo = "";
		if (
			attrs.utm_source ||
			attrs.utm_medium ||
			attrs.utm_campaign ||
			attrs.utm_term ||
			attrs.gclid
		) {
			utmInfo = "\nTracking:";
			if (attrs.utm_source) utmInfo += `\n- UTM Source: ${attrs.utm_source}`;
			if (attrs.utm_medium) utmInfo += `\n- UTM Medium: ${attrs.utm_medium}`;
			if (attrs.utm_campaign) utmInfo += `\n- UTM Campaign: ${attrs.utm_campaign}`;
			if (attrs.utm_term) utmInfo += `\n- UTM Term: ${attrs.utm_term}`;
			if (attrs.gclid) utmInfo += `\n- GCLID: ${attrs.gclid}`;
			if (attrs.referring_url) utmInfo += `\n- Referring URL: ${attrs.referring_url}`;
		}

		return this.toResult(
			`Matter / Prospect ID: ${prospectId}

${contactInfo}${caseInfo}${statusInfo}${stageInfo}${addressInfo}\n\n${dateInfo}${financialInfo}${utmInfo}${customFieldsText}\n${relationshipsText}${relatedNotesText}\n\n

raw data:
${JSON.stringify(prospect, null, 2)}`,
		);
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

		if (!prospect) throw new Error(`Failed to update matter / prospect with ID: ${prospectId}`);

		return this.toResult(`Matter / Prospect with ID ${prospectId} updated successfully.`);
	}

	async searchProspects(query: string) {
		const response = await this.client.searchProspects(query);
		const prospects = response?.data;
		const total = response?.meta?.total || 0;

		if (!prospects || !Array.isArray(prospects)) {
			throw new Error(`Failed to search for matters / prospects matching your query: "${query}"`);
		}

		if (prospects.length === 0) {
			return this.toResult(`Result: No matters / prospects found.`);
		}

		return this.toResult(`Result (first ${prospects.length} shown of ${total} total matters / prospects found matching "${query}"):
${this.formatAsProspectList(prospects)}`);
	}

	async findProspectByName(name: string) {
		try {
			const response = await this.client.findProspectByName(name);
			const prospect = response?.data;

			if (!prospect) {
				return this.toResult(`No matter / prospect found matching the name: "${name}".`);
			}

			return this.toResult(`Matter / Prospect found matching name "${name}":

ID: ${prospect.id}
Name: ${prospect?.attributes?.first_name} ${prospect?.attributes?.last_name}
Email: ${prospect?.attributes?.email || "[Not set]"}
Phone: ${prospect?.attributes?.phone || "[Not set]"}
Created: ${new Date(prospect?.attributes?.created_at || "").toLocaleString()}
Updated: ${new Date(prospect?.attributes?.updated_at || "").toLocaleString()}

${prospect?.attributes?.notes ? `Notes:\n${prospect?.attributes?.notes}` : "[No notes]"}`);
		} catch (error) {
			throw new Error(
				`Failed to find matter / prospect by name: "${name}". ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async findProspectByPhone(phone: string) {
		try {
			const response = await this.client.findProspectByPhone(phone);
			const prospect = response?.data;

			if (!prospect) {
				return this.toResult(`No matter / prospect found matching the phone number: "${phone}".`);
			}

			return this.toResult(`Matter / Prospect found matching phone number "${phone}":

ID: ${prospect.id}
Name: ${prospect?.attributes?.first_name} ${prospect?.attributes?.last_name}
Email: ${prospect?.attributes?.email || "[Not set]"}
Phone: ${prospect?.attributes?.phone || "[Not set]"}
Created: ${new Date(prospect?.attributes?.created_at || "").toLocaleString()}
Updated: ${new Date(prospect?.attributes?.updated_at || "").toLocaleString()}

${prospect?.attributes?.notes ? `Notes:\n${prospect?.attributes?.notes}` : "[No notes]"}`);
		} catch (error) {
			throw new Error(
				`Failed to find matter / prospect by phone: "${phone}". ${error instanceof Error ? error.message : String(error)}`,
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
