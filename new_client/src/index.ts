#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for -lawmatics-mcp v1.0.0
 * Generated on: 2025-05-05T00:22:41.905Z
 */

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
	type CallToolRequest,
	CallToolRequestSchema,
	type CallToolResult,
	ListToolsRequestSchema,
	type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { setupStreamableHttpServer } from "./streamable-http.js";

import axios, { type AxiosRequestConfig, type AxiosError } from "axios";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { ZodError, z } from "zod";

/**
 * Type definition for JSON objects
 */
type JsonObject = Record<string, any>;

/**
 * Interface for MCP Tool Definition
 */
interface McpToolDefinition {
	name: string;
	description: string;
	inputSchema: any;
	method: string;
	pathTemplate: string;
	executionParameters: { name: string; in: string }[];
	requestBodyContentType?: string;
	securityRequirements: any[];
}

/**
 * Server configuration
 */
export const SERVER_NAME = "-lawmatics-mcp";
export const SERVER_VERSION = "1.0.0";
export const API_BASE_URL = "https://api.lawmatics.com";

/**
 * MCP Server instance
 */
const server = new Server(
	{ name: SERVER_NAME, version: SERVER_VERSION },
	{ capabilities: { tools: {} } },
);

/**
 * Map of tool definitions by name
 */
const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([
	[
		"filtermatterbyspecificpracticearea",
		{
			name: "filtermatterbyspecificpracticearea",
			description: `Filter Matter by specific Practice Area`,
			inputSchema: {
				type: "object",
				properties: {
					fields: { type: "string" },
					filter_by: { type: "string" },
					filter_on: { type: "string" },
					filter_with: { type: "string" },
					sort_by: { type: "string" },
					sort_order: { type: "string" },
				},
			},
			method: "get",
			pathTemplate: "/v1/prospects",
			executionParameters: [
				{ name: "fields", in: "query" },
				{ name: "filter_by", in: "query" },
				{ name: "filter_on", in: "query" },
				{ name: "filter_with", in: "query" },
				{ name: "sort_by", in: "query" },
				{ name: "sort_order", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"creatematter",
		{
			name: "creatematter",
			description: `Create a new Matter`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							case_title: { type: "string" },
							company_name: { type: "string" },
							email: { type: "string" },
							first_name: { type: "string" },
							last_name: { type: "string" },
							phone: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/prospects",
			executionParameters: [{ name: "", in: "query" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"address",
		{
			name: "address",
			description: `A specific Stage by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/addresses/{address_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updateaddress",
		{
			name: "updateaddress",
			description: `Updates an **Address** by ID`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							city: { type: "string" },
							country: { type: "string" },
							label: { type: "string" },
							state: { type: "string" },
							street: { type: "string" },
							street2: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/addresses/{address_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deleteaddress",
		{
			name: "deleteaddress",
			description: `Delete an **Address**

**address_id**: ID of the **Address** to delete`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/addresses/{address_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"addresses",
		{
			name: "addresses",
			description: `A **paginated** list of all **Addresses** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/addresses",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createaddress",
		{
			name: "createaddress",
			description: `Create a new **Address**

**Required Fields**: addressable, label, street

**addressable_type**: Prospect, Contact, Company, or Firm that the Address belongs to.

**addressable_id:** Id of Record. Firm type doesn't need an ID passed and it will be ignored.

Note - Setting the **Address** through a **Prospect** (Matter) will set the address on the Prospects' **Contact**/**Company**.`,
			inputSchema: {
				type: "object",
				properties: {
					fields: { type: "string" },
					requestBody: {
						type: "object",
						properties: {
							addressable_id: { type: "number" },
							addressable_type: { type: "string" },
							city: { type: "string" },
							label: { type: "string" },
							state: { type: "string" },
							street: { type: "string" },
							street2: { type: "string" },
							zipcode: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/addresses",
			executionParameters: [{ name: "fields", in: "query" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findcontactbyphonenumber",
		{
			name: "findcontactbyphonenumber",
			description: `Fuzzy find a specific Contact by Phone Number.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/contacts/find_by_phone/{phone_number}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findcontactbyemailaddress",
		{
			name: "findcontactbyemailaddress",
			description: `Fuzzy find a specific Contact by Email Address.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/contacts/find_by_email/{email_address}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findcontactbyname",
		{
			name: "findcontactbyname",
			description: `Fuzzy find (case-insensitive) a specific Contact by their Name. You can pass either '{first_name} {last_name}' or simply '{first_name}'`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/contacts/find_by_name/{name}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"customcontacttype",
		{
			name: "customcontacttype",
			description: `A specific **Custom Contact Type** by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/custom_contact_types/{custom_contact_type_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletecustomcontacttype",
		{
			name: "deletecustomcontacttype",
			description: `Delete an existing **Custom Contact Type** by ID.

Warning: This is irreversible!`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "delete",
			pathTemplate: "/v1/custom_contact_types/{custom_contact_type_id}",
			executionParameters: [],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"customcontacttypes",
		{
			name: "customcontacttypes",
			description: `A **paginated** list of all **Custom Contact Type** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/custom_contact_types",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createcustomcontacttype",
		{
			name: "createcustomcontacttype",
			description: `Create a new **Custom Contact Type**`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/custom_contact_types",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatecustomcontacttype",
		{
			name: "updatecustomcontacttype",
			description: `Update an existing **Custom Contact Type** by ID.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/custom_contact_types/{contact_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"contact",
		{
			name: "contact",
			description: `A specific **Contact** by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/contacts/{contact_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatecontact",
		{
			name: "updatecontact",
			description: `Update an existing **Contact** by ID.

Passing Custom Field id and value, will set the custom field value on the **Contact**, and overwrite any existing value. Passing null as the value will clear it out.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							custom_fields: {
								type: "array",
								items: {
									type: "object",
									properties: { id: { type: "string" }, value: { type: "string" } },
								},
							},
							email: { type: "string" },
							first_name: { type: "string" },
							last_name: { type: "string" },
							notes: {
								type: "array",
								items: {
									type: "object",
									properties: { body: { type: "string" }, name: { type: "string" } },
								},
							},
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/contacts/{contact_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletecontact",
		{
			name: "deletecontact",
			description: `Delete an existing **Contact** by ID.

Warning: This is irreversible!`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "delete",
			pathTemplate: "/v1/contacts/{contact_id}",
			executionParameters: [],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"contacts",
		{
			name: "contacts",
			description: `A **paginated** list of all **Contacts** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/contacts",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createcontact",
		{
			name: "createcontact",
			description: `Create a new **Contact**`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							custom_fields: {
								type: "array",
								items: {
									type: "object",
									properties: { id: { type: "string" }, value: { type: "string" } },
								},
							},
							email: { type: "string" },
							first_name: { type: "string" },
							last_name: { type: "string" },
							notes: {
								type: "array",
								items: {
									type: "object",
									properties: { body: { type: "string" }, name: { type: "string" } },
								},
							},
							phone: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/contacts",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findcompanybyphonenumber",
		{
			name: "findcompanybyphonenumber",
			description: `Fuzzy find a specific **Company** by **Phone Number**. Will look for the **Company** **Phone Number**, then fallback to search though associated **Contacts**.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/companies/find_by_phone/{phone_number}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findcompanybyemailaddress",
		{
			name: "findcompanybyemailaddress",
			description: `Fuzzy find a specific **Company** by **Email Address**. Will look for the **Company** **Email Address**, then fallback to search though associated **Contacts**.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/companies/find_by_email/{email_address}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findcompanybyname",
		{
			name: "findcompanybyname",
			description: `Fuzzy find (case-insensitive) a specific **Company** by Name`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/companies/find_by_name/{name}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"company",
		{
			name: "company",
			description: `A specific **Company** by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/companies/{company_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatecompany",
		{
			name: "updatecompany",
			description: `Update an existing **Company** by ID.

Passing Custom Field id and value, will set the custom field value on the **Company**, and overwrite any existing value. Passing null as the value will clear it out.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							addresses_attributes: {
								type: "array",
								items: {
									type: "object",
									properties: {
										city: { type: "string" },
										country: { type: "string" },
										id: { type: "number" },
										label: { type: "string" },
										state: { type: "string" },
										street: { type: "string" },
										street2: { type: "string" },
										zipcode: { type: "string" },
									},
								},
							},
							city: { type: "string" },
							country: { type: "string" },
							custom_field_values: {
								type: "array",
								items: {
									type: "object",
									properties: { id: { type: "number" }, value: { type: "number" } },
								},
							},
							email: { type: "string" },
							emails_attributes: {
								type: "array",
								items: {
									type: "object",
									properties: {
										id: { type: "number" },
										info: { type: "string" },
										label: { type: "string" },
									},
								},
							},
							name: { type: "string" },
							phone: { type: "string" },
							phone_numbers_attributes: {
								type: "array",
								items: {
									type: "object",
									properties: {
										id: { type: "number" },
										info: { type: "string" },
										label: { type: "string" },
									},
								},
							},
							state: { type: "string" },
							street: { type: "string" },
							street2: { type: "string" },
							zipcode: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/companies/{company_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletecompany",
		{
			name: "deletecompany",
			description: `Delete an existing **Company** by ID.

Warning: This is irreversible!`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/companies/{company_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"companies",
		{
			name: "companies",
			description: `A **paginated** list of all **Companies** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/companies",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createcompany",
		{
			name: "createcompany",
			description: `Create a new **Company**`,
			inputSchema: {
				type: "object",
				properties: {
					fields: { type: "string" },
					requestBody: {
						type: "object",
						properties: {
							addresses_attributes: {
								type: "array",
								items: {
									type: "object",
									properties: {
										city: { type: "string" },
										country: { type: "string" },
										label: { type: "string" },
										state: { type: "string" },
										street: { type: "string" },
										street2: { type: "string" },
										zipcode: { type: "string" },
									},
								},
							},
							city: { type: "string" },
							country: { type: "string" },
							email: { type: "string" },
							emails_attributes: {
								type: "array",
								items: {
									type: "object",
									properties: { info: { type: "string" }, label: { type: "string" } },
								},
							},
							name: { type: "string" },
							phone: { type: "string" },
							phone_numbers_attributes: {
								type: "array",
								items: {
									type: "object",
									properties: { info: { type: "string" }, label: { type: "string" } },
								},
							},
							state: { type: "string" },
							street: { type: "string" },
							street2: { type: "string" },
							zipcode: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/companies",
			executionParameters: [{ name: "fields", in: "query" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"customemail",
		{
			name: "customemail",
			description: `A specific **custom email** by id showcasing the custom email statistics such as unique open count, send count, bounce count, open rate, send rate, and bounce rate.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/custom_emails/{custom_email_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"customemails",
		{
			name: "customemails",
			description: `A list of all **custom emails** in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/custom_emails",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"customfield",
		{
			name: "customfield",
			description: `Specific Custom Field metadata by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/custom_fields/{custom_field_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatecustomfield",
		{
			name: "updatecustomfield",
			description: `Update an existing Custom Field by ID.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							field_type: { type: "string" },
							list_options: { type: "array", items: { type: "number" } },
							name: { type: "string" },
							type: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/custom_fields/{custom_field_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletecustomfield",
		{
			name: "deletecustomfield",
			description: `Delete Custom Field`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/custom_fields/{custom_field_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"customfields",
		{
			name: "customfields",
			description: `A __paginated__ list of all Custom Field metadata in Lawmatics`,
			inputSchema: { type: "object", properties: { fields: { type: "string" } } },
			method: "get",
			pathTemplate: "/v1/custom_fields",
			executionParameters: [{ name: "fields", in: "query" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createcustomfield",
		{
			name: "createcustomfield",
			description: `Create a new Custom Field

Name: Custom Field's name

Type: One of \`Matter\`, \`Contact\`, \`Company\`, \`Client\`, or \`PracticeArea\`

Visibility (optional): \`starred\`, \`hidden\`, \`default\` (default)

field_type: One of \`integer\`, \`boolean\`, \`string\`, \`text\`, \`currency\`, \`date\`, \`time\`, \`datetime\`, \`list\`, \`lookup\`, \`multi_picklist\`

list_options: Required if field_type is \`list\` or \`multi_picklist\`, two options at minimum

lookup_type: Required if field_type is \`lookup\`. One of \`User\`, \`Contact\`, \`Company\` or \`Prospect\`

practice_area: Name of practice area. Required if type is \`PracticeArea\``,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							field_type: { type: "string" },
							list_options: { type: "array", items: { type: "string" } },
							name: { type: "string" },
							practice_area: { type: "string" },
							type: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/custom_fields",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"customform",
		{
			name: "customform",
			description: `This *Unauthenticated* endpoint takes a __Custom Form__ id and returns metadata about that __Custom Form__. This metadata can be used to recreate a Lawmatics __Custom Form__ to be filled using your own html code.`,
			inputSchema: { type: "object", properties: { fields: { type: "string" } } },
			method: "get",
			pathTemplate: "/v1/forms/{custom_form_uuid}",
			executionParameters: [{ name: "fields", in: "query" }],
			requestBodyContentType: undefined,
			securityRequirements: [{}],
		},
	],
	[
		"customforms",
		{
			name: "customforms",
			description: `A __paginated__ list of all Custom Forms in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/forms",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"customformentries",
		{
			name: "customformentries",
			description: `A __paginated__ list of all Custom Form Entries in Lawmatics by Custom Form uuid`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/forms/{custom_form_uuid}/entries",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"submitcustomformentryformdatabody",
		{
			name: "submitcustomformentryformdatabody",
			description: `This *Unauthenticated* (YOU DO NOT NEED A DEVELOPER APP) endpoint submits __Custom Form__ values. Keys for the values use the __Custom Form__ field ids found in Lawmatics, or found via the GET endpoint.

Data should be serialized via form-data (plain html5 forms) or JSON body (shown in next example)

Any automations will trigger as expected when this __Custom Form__ is submitted via the API.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							"RmllbGRzOjpDdXN0b21GaWVsZC1DdXN0b21GaWVsZDo6UHJvc3BlY3QtMTAyNw==": {
								type: "string",
							},
							custom_field_2263: { type: "string" },
							first_name: { type: "string" },
							last_name: { type: "string" },
							utm_campaign: { type: "string" },
							utm_source: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/forms/{custom_form_uuid}/submit",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{}],
		},
	],
	[
		"emailaddress",
		{
			name: "emailaddress",
			description: `A specific **Email Address** by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/email_addresses/{email_address_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updateemailaddress",
		{
			name: "updateemailaddress",
			description: `Updates a **Email Address** by id`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							info: { type: "string" },
							informationable_id: { type: "number" },
							informationable_type: { type: "string" },
							label: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/email_addresses/{email_address_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deleteemailaddress",
		{
			name: "deleteemailaddress",
			description: `Delete a **Email Address** by ID

**email_address_id**: ID of the **Email Address** to delete`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/email_addresses/{email_address_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"emailaddresses",
		{
			name: "emailaddresses",
			description: `A **paginated** list of all **Email Addresses** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/email_addresses",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createemailaddress",
		{
			name: "createemailaddress",
			description: `Create a new **Email Address**

**Required Fields**: informationable, label, info

**info:** The **Email Address** string.

**label**: The **Email Address's** label e.g. Primary.

**informationable_type**: **Prospect**, **Contact**, **Company**, or **Firm** that the **Email Address** belongs to.

**informationable_id:** Id of Record. **Firm** type doesn't need an ID passed and it will be ignored.

Note - Setting the **Email Address** through a **Prospect** (Matter) will set it on on the **Prospects**' **Contact**/**Company**.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							info: { type: "string" },
							informationable_id: { type: "number" },
							informationable_type: { type: "string" },
							label: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/email_addresses",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"emailcampaign",
		{
			name: "emailcampaign",
			description: `Returns a specific campaign in **Lawmatics**.

To retrieve a specific campaign, use the following format: TypeofCampaign-id

An example of retrieving a marketing campaign would be:  
/v1/email_campaigns/MarketingCampaign-1

An example of retrieving a recurring campaign would be:  
/v1/email_campaigns/RecurringCampaign-1

An example of retrieving a date campaign would be:  
/v1/email_campaigns/DateCampaign-1`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/email_campaigns/{id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"emailcampaigns",
		{
			name: "emailcampaigns",
			description: `Returns all email campaigns in **Lawmatics**.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/email_campaigns",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"emailcampaignstats",
		{
			name: "emailcampaignstats",
			description: `Retrieves a statistics of a specific email campaign in Lawmatics.

To retrieve a specific campaign, use the following format: TypeofCampaign-id

An example of retrieving statistics of a marketing campaign would be:  
/v1/email_campaign_stats/MarketingCampaign-1

An example of retrieving statistics of a date campaign would be:  
/v1/email_campaign_stats/DateCampaign-1`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/email_campaign_stats/{id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"event",
		{
			name: "event",
			description: `A __paginated__ list of all Events in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/events/{event_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updateevent",
		{
			name: "updateevent",
			description: `Update an existing Matter by ID.

PATCH works for this endpoint as well as PUT.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							all_day: { type: "boolean" },
							description: { type: "string" },
							end_date: { type: "string" },
							event_type_id: { type: "string" },
							eventable_id: { type: "string" },
							eventable_type: { type: "string" },
							location_id: { type: "string" },
							name: { type: "string" },
							no_show: { type: "boolean" },
							reminder_delay_length: { type: "number" },
							reminder_type: { type: "string" },
							send_invites: { type: "boolean" },
							start_date: { type: "string" },
							time_zone: { type: "string" },
							user_ids: { type: "array", items: { type: "number" } },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/events/{event_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"cancelevent",
		{
			name: "cancelevent",
			description: `Cancels an existing Event/Appointment`,
			inputSchema: {
				type: "object",
				properties: {
					notify_attendees: { type: "string" },
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/events/{event_id}",
			executionParameters: [{ name: "notify_attendees", in: "query" }],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"events",
		{
			name: "events",
			description: `A __paginated__ list of all Events in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/events",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createevent",
		{
			name: "createevent",
			description: `Create a new **Event**/Appointment

**Optional Fields**: Reminder fields, **Location** fields, time_zone

**eventable_type, eventable_id**: The **Prospect**, **Contact**, or **Client** that the appointment is with.

**user_ids**: The Firm **Users** hosting the appointment.

**reminder_type**: 'minutes', 'hours', 'days', 'weeks', months'

**reminder_delay_length:** Integer value (combined with reminder_type) for how long to wait to send a reminder

**send_invites:** (default true)

**all_day:** (default false)

**time_zone**: a valid [tz identifier string](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)), (defaults to null)`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							all_day: { type: "boolean" },
							description: { type: "string" },
							end_date: { type: "string" },
							event_type_id: { type: "string" },
							eventable_id: { type: "string" },
							eventable_type: { type: "string" },
							location_id: { type: "string" },
							name: { type: "string" },
							reminder_delay_length: { type: "number" },
							reminder_type: { type: "string" },
							start_date: { type: "string" },
							time_zone: { type: "string" },
							user_ids: { type: "array", items: { type: "number" } },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/events",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"locations",
		{
			name: "locations",
			description: `A __paginated__ list of all Firm Locations in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/locations",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"eventtype",
		{
			name: "eventtype",
			description: `A specific **Event Type** by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/event_types/{event_type_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updateeventtype",
		{
			name: "updateeventtype",
			description: `Updates an **Event Type**`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { duration: { type: "number" }, name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/event_types/{event_type_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deleteeventtype",
		{
			name: "deleteeventtype",
			description: `Delete an **Event Type**`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/event_types/{event_type_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"eventtypes",
		{
			name: "eventtypes",
			description: `A **paginated** list of all **Event Types** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/event_types",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createeventtype",
		{
			name: "createeventtype",
			description: `Create a new **Event Type**

**duration**: Default event duration (in minutes)

**name**: Name of the **Event Type**`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { duration: { type: "number" }, name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/event_types",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"file",
		{
			name: "file",
			description: `A specific File's metadata in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/files/{file_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatefilemetadata",
		{
			name: "updatefilemetadata",
			description: `Updates an **File** by ID

**documentable_type**: One of \\["firm", "client", "matter", "contact"\\]

**documentable_id:** The record ID, not needed for Firm documentable_type.

**file**: File to upload

**folder_id:** the Folder ID the file should be located in

**name:** name for the File. Defaults to uploaded file name

**path:** String Array. e.g. \\["Root", "Folder 1", "Folder 2"\\]. Finds folder with name or creates it if it doesn't exist. Path overrides folder_id if both given.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/files/{file_id}",
			executionParameters: [{ name: "", in: "query" }],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletefile",
		{
			name: "deletefile",
			description: `Deletes a **File** by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/files/{file_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"files",
		{
			name: "files",
			description: `A **paginated** list of all File metadata in Lawmatics

Can be filtered by \`matter_id\` , \`prospect_id\` , \`contact_id\` , \`client_id\` and \`firm\`

as well as all the regular fields as referenced by our Param Guide (most fields returned by\`?fields=all\`).`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/files",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"uploadfile",
		{
			name: "uploadfile",
			description: `Uploads a file to a Firm, Matter, Contact or Client

Max allowed file size is 1GB. However, we recommend to avoid files greater than 100MB.

**documentable_type**: One of \\["firm", "client", "matter", "contact"\\]

**documentable_id:** The record ID, not needed for Firm documentable_type.

**file**: File to upload

**folder_id:** the Folder ID the file should be located in

**name:** name for the File. Defaults to uploaded file name

**path:** String Array. e.g. \\["Root", "Folder 1", "Folder 2"\\]. Finds folder with name or creates it if it doesn't exist. Path overrides folder_id if both given.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/files",
			executionParameters: [],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"downloadfile",
		{
			name: "downloadfile",
			description: `*   When testing from **Postman** please click on '**Send and download**' option instead of '**Send**'.
    

*   a 404 can be sent case the file isn't found.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/files/download/{id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"folder",
		{
			name: "folder",
			description: `A specific Folder's metadata in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/folders/{folder_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatefolder",
		{
			name: "updatefolder",
			description: `Updates a **Folder** by ID

**documentable_type**: One of \\["matter", "contact"\\]

**documentable_id:** The record ID

**name**: Folder name. Must be unique within parent folder. Returns 429 if name is already taken. Any slashes "/" in folder name will be replaces with colons ":"

**folder_id**: Folder ID if adding a subfolder

**path:** String Array. e.g. \\["Root", "Folder 1", "Folder 2"\\]. Finds folders with the name or creates it if it doesn't exist. Moves folder into the Folder with the last name in the path. \`path\` overrides **\`folder_id\`** if both given.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/folders/{folder_id}",
			executionParameters: [],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletefolder",
		{
			name: "deletefolder",
			description: `Deletes a **Folder** by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/folders/{folder_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"folders",
		{
			name: "folders",
			description: `A **paginated** list of all Folder metadata in Lawmatics

Can be filtered by \`matter_id\` , \`prospect_id\` , \`contact_id\`

as well as all the regular fields as referenced by our Param Guide (most fields returned by\`?fields=all\`).`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/folders",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createfolder",
		{
			name: "createfolder",
			description: `Creates a folder for a Matter or Contact

**documentable_type**: One of \\["matter", "contact"\\]

**documentable_id:** The record ID

**name**: Folder name. Must be unique within parent folder. Returns 429 if name is already taken. Any slashes "/" in folder name will be replaces with colons ":"

**folder_id**: Folder ID if adding a subfolder

**path:** String Array. e.g. \\["Root", "Folder 1", "Folder 2"\\]. Finds the folder with the name or creates it if it doesn't exist. Path overrides folder_id if both given.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/folders",
			executionParameters: [],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findmatterbyphonenumber",
		{
			name: "findmatterbyphonenumber",
			description: `Fuzzy find a specific Matter by Phone Number.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/prospects/find_by_phone/{phone_number}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findmatterbyemailaddress",
		{
			name: "findmatterbyemailaddress",
			description: `Fuzzy find a specific Matter by Email Address.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/prospects/find_by_email/{email_address}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"findmatterbyname",
		{
			name: "findmatterbyname",
			description: `Fuzzy find (case-insensitive) a specific Matter by their Name. You can pass either '{first_name} {last_name}' or simply '{first_name}'`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/prospects/find_by_name/{name}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"interaction",
		{
			name: "interaction",
			description: `Retrieves an interaction by its ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/interactions/{interaction_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updateinteraction",
		{
			name: "updateinteraction",
			description: `Update an existing Interaction by ID.

PATCH works for this endpoint as well as PUT.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							body: { type: "string" },
							happened_at: { type: "string" },
							interaction_type: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/interactions/{interaction_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deleteinteraction",
		{
			name: "deleteinteraction",
			description: `Deletes an existing interaction`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/interactions/{interaction_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"interactions",
		{
			name: "interactions",
			description: `A **paginated** list of all Interactions in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/interactions/",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createinteraction",
		{
			name: "createinteraction",
			description: `Create a new **Interaction**

Required fields:

**happened_at**: timestamp meaning when the interaction happened

**prospect_id:** Integer value, id of the prospect this interaction is related to

**body:** text describing the interaction

**interaction_type:** a string describing the kind of interaction that happened`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							body: { type: "string" },
							happened_at: { type: "string" },
							interaction_type: { type: "string" },
							prospect_id: { type: "number" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/interactions",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"campaign",
		{
			name: "campaign",
			description: `A specific Marketing Campaign by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/campaigns/{campaign_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"campaigns",
		{
			name: "campaigns",
			description: `A __paginated__ list of all Marketing Campaigns in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/campaigns",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"source",
		{
			name: "source",
			description: `A specific Marketing Source by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/sources/{source_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"sources",
		{
			name: "sources",
			description: `A __paginated__ list of all Marketing Sources in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/sources",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"pipeline",
		{
			name: "pipeline",
			description: `A specific Pipeline by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/pipelines/{pipeline_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"pipelines",
		{
			name: "pipelines",
			description: `A __paginated__ list of all Pipelines in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/pipelines",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"stage",
		{
			name: "stage",
			description: `A specific Stage by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/stages/{stage_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"stages",
		{
			name: "stages",
			description: `A __paginated__ list of all Stages in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/stages",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"practicearea",
		{
			name: "practicearea",
			description: `A specific Practice Area by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/practice_areas/{practice_area_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatepracticearea",
		{
			name: "updatepracticearea",
			description: `Updates an existing Practice Area

**Optional Fields**: statute_of_limitations_enabled

**name**: The Area name

**color**: The Area color. Can be any CSS valid color (hex, rgb, hsl, colorname string, etc)

**statute_of_limitations_enabled**: If Statute of Limitations is enabled`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							color: { type: "string" },
							name: { type: "string" },
							statute_of_limitations_enabled: { type: "boolean" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/practice_areas/{practice_area_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletepracticearea",
		{
			name: "deletepracticearea",
			description: `Deletes an existing Practice Area`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/practice_areas/{practice_area_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"practiceareas",
		{
			name: "practiceareas",
			description: `A __paginated__ list of all Practice Areas in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/practice_areas",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createpracticearea",
		{
			name: "createpracticearea",
			description: `Create a new Practice Area

**Optional Fields**: statute_of_limitations_enabled

**name**: The Area name

**color**: The Area color. Can be any CSS valid color (hex, rgb, hsl, colorname string, etc)

**statute_of_limitations_enabled**: If Statute of Limitations is enabled`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							color: { type: "string" },
							name: { type: "string" },
							statute_of_limitations_enabled: { type: "boolean" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/practice_areas",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"relationship",
		{
			name: "relationship",
			description: `A specific **Relationship** by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/relationships/{relationship_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updaterelationship",
		{
			name: "updaterelationship",
			description: `Update Relationship`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							contact_id: { type: "string" },
							prospect_id: { type: "string" },
							relationship_type_id: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/relationships/{relationship_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deleterelationship",
		{
			name: "deleterelationship",
			description: `Delete a Relationship by ID`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/relationships/{relationship_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"relationships",
		{
			name: "relationships",
			description: `A __paginated__ list of all Relationships in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/relationships",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createrelationship",
		{
			name: "createrelationship",
			description: `Create a new Relationship

If the **Relationship Type** allows multiple, you can create more than one **Relationship** per **Matter**.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							contact_id: { type: "string" },
							prospect_id: { type: "string" },
							relationship_type_id: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/relationships",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"relationshiptype",
		{
			name: "relationshiptype",
			description: `A specific **Relationship Type** by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/relationship_types/{relationship_type_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updaterelationshiptype",
		{
			name: "updaterelationshiptype",
			description: `Update Relationship`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/relationship_types/{relationship_type_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"relationshiptypes",
		{
			name: "relationshiptypes",
			description: `A __paginated__ list of all Relationship Types in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/relationship_types",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createrelationshiptype",
		{
			name: "createrelationshiptype",
			description: `Create a new Relationship Type`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { is_repeatable: { type: "boolean" }, name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/relationship_types",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"substatus",
		{
			name: "substatus",
			description: `A specific Stage by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/sub_statuses/{status_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"substatuses",
		{
			name: "substatuses",
			description: `A __paginated__ list of all Stages in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/sub_statuses",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createsubstatus",
		{
			name: "createsubstatus",
			description: `Create a new **Matter Sub Status**

Valid \`status\`values: 'hired', 'pnc', 'lost' (default 'pnc')

Accepts \`created_by_id\``,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { name: { type: "string" }, status: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/sub_statuses",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatesubstatus",
		{
			name: "updatesubstatus",
			description: `Update an existing **Matter Sub Status** by ID

Valid \`status\`values: 'hired', 'pnc', 'lost' (default 'pnc')

Accepts \`created_by_id\``,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/sub_statuses/{sub_status_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletesubstatus",
		{
			name: "deletesubstatus",
			description: `Delete an existing **Matter Sub Status** by ID.

Warning: This is irreversible!`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "delete",
			pathTemplate: "/v1/sub_statuses/{sub_status_id}",
			executionParameters: [],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"matter",
		{
			name: "matter",
			description: `Return one Matter by id`,
			inputSchema: { type: "object", properties: { fields: { type: "string" } } },
			method: "get",
			pathTemplate: "/v1/prospects/{prospect_id}",
			executionParameters: [{ name: "fields", in: "query" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatematter",
		{
			name: "updatematter",
			description: `Update an existing Matter by ID.

Passing Custom Field id and value, will set the custom field value on the Matter, and overwrite any existing value. Passing null as the value will clear it out.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							assigned_staff_ids: { type: "array", items: {} },
							custom_fields: {
								type: "array",
								items: {
									type: "object",
									properties: {
										id: { type: "string" },
										value: {
											anyOf: [
												{ type: "boolean", example: false },
												{ type: "string", example: "2" },
												{ nullable: true, example: null },
											],
											type: "null",
										},
									},
								},
							},
							email: { type: "string" },
							first_name: { type: "string" },
							last_name: { type: "string" },
							notes: {
								type: "array",
								items: {
									type: "object",
									properties: { body: { type: "string" }, name: { type: "string" } },
								},
							},
							phone: { type: "string" },
							tags: { type: "array", items: { type: "string" } },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/prospects/{prospect_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletematter",
		{
			name: "deletematter",
			description: `Delete an existing Matter by ID.

Warning: This is irreversible!`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "delete",
			pathTemplate: "/v1/prospects/{prospect_id}",
			executionParameters: [],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"note",
		{
			name: "note",
			description: `A specific **Note** by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/notes/{note_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatenote",
		{
			name: "updatenote",
			description: `Update Note`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { body: { type: "string" }, name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/notes/{note_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletenote",
		{
			name: "deletenote",
			description: `Delete Note`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/notes/{note_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"notes",
		{
			name: "notes",
			description: `A __paginated__ list of all Notes in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/notes",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createnote",
		{
			name: "createnote",
			description: `Create Note`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							body: { type: "string" },
							name: { type: "string" },
							notable_id: { type: "number" },
							notable_type: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/notes",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"invoice",
		{
			name: "invoice",
			description: `A specific Invoice in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/invoices/{invoice_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"invoices",
		{
			name: "invoices",
			description: `A **paginated** list of all Invoices in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/invoices",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"expenses",
		{
			name: "expenses",
			description: `A **paginated** list of all **Time Entries** in Lawmatics`,
			inputSchema: { type: "object", properties: { fields: { type: "string" } } },
			method: "get",
			pathTemplate: "/v1/expenses",
			executionParameters: [
				{ name: "fields", in: "query" },
				{ name: "", in: "header" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"expense",
		{
			name: "expense",
			description: `A specific **Time Entry** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/expenses/{expense_id}",
			executionParameters: [{ name: "", in: "header" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updateexpense",
		{
			name: "updateexpense",
			description: `A specific **Time Entry** in Lawmatics`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/expenses/{expense_id}",
			executionParameters: [{ name: "", in: "header" }],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"expense1",
		{
			name: "expense1",
			description: `A specific **Time Entry** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/expenses/{expense_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createexpense",
		{
			name: "createexpense",
			description: `A specific **Time Entry** in Lawmatics`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/expenses/",
			executionParameters: [{ name: "", in: "header" }],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"timeentries",
		{
			name: "timeentries",
			description: `A **paginated** list of all **Time Entries** in Lawmatics`,
			inputSchema: { type: "object", properties: { fields: { type: "string" } } },
			method: "get",
			pathTemplate: "/v1/time_entries",
			executionParameters: [
				{ name: "fields", in: "query" },
				{ name: "", in: "header" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"timeentry",
		{
			name: "timeentry",
			description: `A specific **Time Entry** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/time_entries/{time_entry_id}",
			executionParameters: [{ name: "", in: "header" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatetimeentry",
		{
			name: "updatetimeentry",
			description: `A specific **Time Entry** in Lawmatics`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/time_entries/{time_entry_id}",
			executionParameters: [{ name: "", in: "header" }],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"timeentry1",
		{
			name: "timeentry1",
			description: `A specific **Time Entry** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/time_entries/{time_entry_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createtimeentry",
		{
			name: "createtimeentry",
			description: `A specific **Time Entry** in Lawmatics`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/time_entries/",
			executionParameters: [{ name: "", in: "header" }],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"transaction",
		{
			name: "transaction",
			description: `A specific **Transaction** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/transactions/{transaction_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"transactions",
		{
			name: "transactions",
			description: `A **paginated** list of all **Transactions** in Lawmatics`,
			inputSchema: { type: "object", properties: { fields: { type: "string" } } },
			method: "get",
			pathTemplate: "/v1/transactions",
			executionParameters: [{ name: "fields", in: "query" }],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createtransaction",
		{
			name: "createtransaction",
			description: `Create a new Transaction

**Optional Fields**: invoice_number, invoice_id, note  
  
**invoice_number or invoice_id:** only one should be specified

**transactable**: Prospect, Contact, Company with which to associate the transaction

**transaction_type**: debit or credit

**bank_account_type**: operating or trust

**payment_method**: credit_card, check, cash, paypal, venmo, trust_payment, debit_card, ach, or other`,
			inputSchema: {
				type: "object",
				properties: {
					fields: { type: "string" },
					requestBody: {
						type: "object",
						properties: {
							amount_cents: { type: "number" },
							bank_account_type: { type: "string" },
							executed_at: { type: "string" },
							invoice_number: { type: "number" },
							note: { type: "string" },
							payment_method: { type: "string" },
							transactable_id: { type: "number" },
							transactable_type: { type: "string" },
							transaction_type: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/transactions",
			executionParameters: [{ name: "fields", in: "query" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"phonenumber",
		{
			name: "phonenumber",
			description: `A specific **Phone Number** by id`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/phone_numbers/{phone_number_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatephonenumber",
		{
			name: "updatephonenumber",
			description: `Updates a **Phone Number** by id`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "put",
			pathTemplate: "/v1/phone_numbers/{phone_number_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletephonenumber",
		{
			name: "deletephonenumber",
			description: `Delete a **Phone Number**

**phone_number_id**: ID of the **Phone Number** to delete`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/phone_numbers/{phone_number_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"phonenumbers",
		{
			name: "phonenumbers",
			description: `A **paginated** list of all **Phone Numbers** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/phone_numbers",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createphonenumber",
		{
			name: "createphonenumber",
			description: `Create a new **Phone Number**

**Required Fields**: informationable, label, info

  
**info:** The Phone Number string.

**label**: The **Phone Number**'s label e.g. Primary.

**informationable_type**: **Prospect**, **Contact**, **Company**, or **Firm** that the **Phone Number** belongs to.

**informationable_id:** Id of Record. **Firm** type doesn't need an ID passed and it will be ignored.

Note - Setting the **Phone Number** through a **Prospect** (Matter) will set the address on the **Prospects**' **Contact**/**Company**.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: multipart/form-data)",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/phone_numbers",
			executionParameters: [],
			requestBodyContentType: "multipart/form-data",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"tag",
		{
			name: "tag",
			description: `A specific Tag in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/tags/{tag_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatetag",
		{
			name: "updatetag",
			description: `Updates a Tag

**Optional Fields**: Description, Color

**title**: The Tag title

**description**: The Tag description

**color**: The Tag color. Can be any CSS valid color (hex, rgb, hsl, colorname string, etc)`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							color: { type: "string" },
							description: { type: "string" },
							name: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/tags/{tag_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletetag",
		{
			name: "deletetag",
			description: `Delete a Tag

**tag_id**: ID of the tag to delete`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/tags/{tag_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"tags",
		{
			name: "tags",
			description: `A **paginated** list of all Tags in Lawmatics

Can be filtered by \`matter_id\` , \`prospect_id\` , \`contact_id\` , \`company_id\`, \`task_id\` and \`user_id\`

as well as all the regular fields as referenced by our Param Guide (most fields returned by\`?fields=all\`).`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/tags",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createtag",
		{
			name: "createtag",
			description: `Create a new Tag

**Optional Fields**: Description, Color

**title**: The Tag title

**description**: The Tag description

**color**: The Tag color. Can be any CSS valid color (hex, rgb, hsl, colorname string, etc)`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							color: { type: "string" },
							description: { type: "string" },
							name: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/tags",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"attachtag",
		{
			name: "attachtag",
			description: `Attaches tags to a **Matter**, **Contact**, **Company**, or **Task**

**(type)_id:** The ID of the entity to attach tags to. One of \`matter_id\`, \`contact_id\`, \`company_id,\` or \`task_id\`.

**tags:** List of tags to attach. If a tag does not exist, it will be created.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							matter_id: { type: "number" },
							tags: { type: "array", items: { type: "string" } },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/tags/attach",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"detachtag",
		{
			name: "detachtag",
			description: `Detaches tags from a Matter, Contact, Company, or Task

**(type)_id:** The ID of the entity to detach **Tags** from. One of \`matter_id\`, \`contact_id\`, \`company_id,\` or \`task_id\`.

**tags:** List of **Tags** to detach. If a **Tag** does not exist, it will be ignored.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							matter_id: { type: "number" },
							tags: { type: "array", items: { type: "string" } },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/tags/detach",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"task",
		{
			name: "task",
			description: `A specific **Task** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/tasks/{task_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatetask",
		{
			name: "updatetask",
			description: `Updates a **Task**

**Optional Fields**: user_ids, priority, done, taskable, tag_ids, assigned_by_id, recurrence_rule

**due_date**: **Task** due date (iso8601 datetime)

**user_ids**: The Firm **User** ids that will be assigned to this **Task**.

**priority**: high, medium, low (default)

**done**: true or false (default)

**taskable_type, taskable_id:** Record type, ID the **Task** is associated with (Prospect (Matter), Contact, Company, Client).

**tag_ids**: **Tags** to associate to this **Task.  
  
assigned_by_id:** The **user id** the task is assigned by.

**recurrence_rule: Json object.** Following are the fields with which we can create a recurrence_rule.  
RecurrenceType options are the following = 'daily' or 'weekly' or monthly' or 'yearly';

fields of the json object you can choose from:  
type: **RecurrenceType**;  
endOption?: boolean;  
endDate?: Date;

**// If you choose type to be daily**

frequency?: number;

**// If you choose type to be weekly**

sunday?: boolean;  
monday?: boolean;  
tuesday?: boolean;  
wednesday?: boolean;  
thursday?: boolean;  
friday?: boolean;  
saturday?: boolean;

**// If you choose type to be monthly**  
monthlyFrequency?: number;  
dayOfMonth?: number;

**// If you choose type to be yearly**  
month?: string;  
dayOfMonthYear?: number;`,
			inputSchema: {
				type: "object",
				properties: {
					fields: { type: "string" },
					requestBody: {
						type: "object",
						properties: {
							assigned_by_id: { type: "number" },
							description: { type: "string" },
							done: { type: "boolean" },
							due_date: { type: "string" },
							name: { type: "string" },
							priority: { type: "string" },
							recurrence_rule: {
								type: "object",
								properties: {
									end_date: { type: "string" },
									type: { type: "string" },
									wednesday: { type: "boolean" },
								},
							},
							tag_ids: { type: "array", items: { type: "number" } },
							user_ids: { type: "array", items: { type: "number" } },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/tasks/{task_id}",
			executionParameters: [{ name: "fields", in: "query" }],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletetask",
		{
			name: "deletetask",
			description: `Delete a **Task**`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: { type: "string", description: "Request body (content type: text/plain)" },
				},
			},
			method: "delete",
			pathTemplate: "/v1/tasks/{task_id}",
			executionParameters: [],
			requestBodyContentType: "text/plain",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"tasks",
		{
			name: "tasks",
			description: `A **paginated** list of all **Tasks** in Lawmatics

Can be filtered by \`matter_id,\` \`prospect_id,\` \`contact_id,\` \`company_id,\` \`client_id,\` and\`user_id\`

as well as all the regular fields as referenced by our Param Guide (most fields returned by\`?fields=all\`).`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/tasks",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createtask",
		{
			name: "createtask",
			description: `Create a new **Task**

**Optional Fields**: user_ids, priority, done, taskable, tag_ids, assigned_by_id, recurrence_rule

**due_date**: **Task's** due date (iso8601 datetime)

**user_ids**: The Firm **User** ids assigned to this **Task**.

**priority**: high, medium, low (default)

**done**: true or false (default)

**taskable_type, taskable_id:** Record type, ID the **Task** is associated with (Prospect (Matter), Contact, Company, Client)

**tag_ids**: **Tags** to associate to this **Task**

**assigned_by_id:** The **user id** the task is assigned by.

**recurrence_rule: Json object.** Following are the fields with which we can create a recurrence_rule.  
RecurrenceType options are the following = 'daily' or 'weekly' or monthly' or 'yearly';

fields of the json object you can choose from:  
type: **RecurrenceType**;  
endOption?: boolean;  
endDate?: Date;

**// If you choose type to be daily**

frequency?: number;

**// If you choose type to be weekly**

sunday?: boolean;  
monday?: boolean;  
tuesday?: boolean;  
wednesday?: boolean;  
thursday?: boolean;  
friday?: boolean;  
saturday?: boolean;

**// If you choose type to be monthly**  
monthlyFrequency?: number;  
dayOfMonth?: number;

**// If you choose type to be yearly**  
month?: string;  
dayOfMonthYear?: number;`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							assigned_by_id: { type: "number" },
							description: { type: "string" },
							done: { type: "boolean" },
							due_date: { type: "string" },
							name: { type: "string" },
							priority: { type: "string" },
							recurrence_rule: {
								type: "object",
								properties: {
									endDate: { type: "string" },
									frequency: { type: "number" },
									type: { type: "string" },
								},
							},
							tag_ids: { type: "array", items: { type: "number" } },
							taskable_id: { type: "number" },
							taskable_type: { type: "string" },
							user_ids: { type: "array", items: { type: "number" } },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/tasks",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"subtask",
		{
			name: "subtask",
			description: `A specific **subtask** in tasks in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/tasks/{task_id}/subtasks/{subtask_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatesubtask",
		{
			name: "updatesubtask",
			description: `Updates a **subtask** on a task.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { body: { type: "string" }, done: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/tasks/{task_id}/subtasks/{subtask_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletesubtask",
		{
			name: "deletesubtask",
			description: `Deletes a **subtask** from a task.`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/tasks/{task_id}/subtasks/{subtask_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"subtasks",
		{
			name: "subtasks",
			description: `All the **subtasks** that belong to a task in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/tasks/{task_id}/subtasks",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createsubtask",
		{
			name: "createsubtask",
			description: `Creates a new **subtask** on a task.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { body: { type: "string" }, done: { type: "boolean" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/tasks/{task_id}/subtasks",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"comment",
		{
			name: "comment",
			description: `A specific **comment** on a task in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/tasks/{task_id}/comments/{comment_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatecomment",
		{
			name: "updatecomment",
			description: `Updates a **specific comment** on a task in Lawmatics.

**optional field:** mentioned_user_ids

mentioned_user_ids: list of user ids.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							body: { type: "string" },
							mentioned_user_ids: { type: "array", items: { type: "number" } },
							user_id: { type: "number" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/tasks/{task_id}/comments/{comment_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletecomment",
		{
			name: "deletecomment",
			description: `Deletes a **specific comment** on a task in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/tasks/{task_id}/comments/{comment_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"comments",
		{
			name: "comments",
			description: `Retrieves all the **comments** on a task in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/tasks/{task_id}/comments",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createcomment",
		{
			name: "createcomment",
			description: `Creates a **comment** on a task in Lawmatics.  
**optional field:** mentioned_user_ids

mentioned_user_ids: list of user ids.

Feel free to add HTML tags to format your comments.

Following is a simple comment with formatting example using bold *italic* etc.  

This is a simple comment with formatting example using **bold** *italics*

Another example of comment with mentioned users.  

Hi its a new comment on task 45 @Jasmine Rattan`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "string",
						description: "Request body (content type: application/json)",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/tasks/{task_id}/comments",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"taskstatus",
		{
			name: "taskstatus",
			description: `A **specific task status** in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/task_statuses/{task_status_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updatetaskstatus",
		{
			name: "updatetaskstatus",
			description: `Updates a **task status** in Lawmatics.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { color: { type: "string" }, name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/task_statuses/{task_status_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deletetaskstatus",
		{
			name: "deletetaskstatus",
			description: `Deletes a **task status** in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/task_statuses/{task_status_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"taskstatuses",
		{
			name: "taskstatuses",
			description: `Gets all the task statuses in Lawmatics.`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/task_statuses",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createtaskstatus",
		{
			name: "createtaskstatus",
			description: `Creates a **task status** in Lawmatics.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: { color: { type: "string" }, name: { type: "string" } },
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/task_statuses",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"activity",
		{
			name: "activity",
			description: `A specific **Activity** in Lawmatics`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/activities/{activity_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"activities",
		{
			name: "activities",
			description: `A **paginated** list of Activities in Lawmatics

Can be filtered by \`matter_id,\` \`contact_id,\` \`type,\` and\`event\`

as well as all the regular fields as referenced by our Param Guide (most fields returned by\`?fields=all\`).`,
			inputSchema: {
				type: "object",
				properties: {
					filter_by: { type: "string", description: "matter_id, contact_id, type or event" },
					filter_on: { type: "string" },
				},
			},
			method: "get",
			pathTemplate: "/v1/activities",
			executionParameters: [
				{ name: "filter_by", in: "query" },
				{ name: "filter_on", in: "query" },
				{ name: "", in: "query" },
			],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"user",
		{
			name: "user",
			description: `Return a specific User by ID`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/users/{user_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"updateuser",
		{
			name: "updateuser",
			description: `Updates a user`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							email: { type: "string" },
							first_name: { type: "string" },
							last_name: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "put",
			pathTemplate: "/v1/users/{user_id}",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"deleteuser",
		{
			name: "deleteuser",
			description: `Dissociates a user from a firm, in practice this is the same as deleting the user as it won't have access to the system anymore.`,
			inputSchema: { type: "object", properties: {} },
			method: "delete",
			pathTemplate: "/v1/users/{user_id}",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"users",
		{
			name: "users",
			description: `Return a __paginated__ list of all users in the firm`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/users",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"createuser",
		{
			name: "createuser",
			description: `Creates a user or assigns it to the firm if it already exists.`,
			inputSchema: {
				type: "object",
				properties: {
					requestBody: {
						type: "object",
						properties: {
							email: { type: "string" },
							first_name: { type: "string" },
							last_name: { type: "string" },
							password: { type: "string" },
							role: { type: "string" },
						},
						description: "The JSON request body.",
					},
				},
			},
			method: "post",
			pathTemplate: "/v1/users",
			executionParameters: [],
			requestBodyContentType: "application/json",
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
	[
		"me",
		{
			name: "me",
			description: `Return the authenticated user`,
			inputSchema: { type: "object", properties: {} },
			method: "get",
			pathTemplate: "/v1/users/me",
			executionParameters: [],
			requestBodyContentType: undefined,
			securityRequirements: [{ oauth2: [] }, { bearerAuth: [] }],
		},
	],
]);

/**
 * Security schemes from the OpenAPI spec
 */
const securitySchemes = {
	oauth2: {
		type: "oauth2",
		flows: {
			authorizationCode: {
				authorizationUrl: "localhost:3001/oauth/authorize",
				tokenUrl: "localhost:3001/oauth/token",
				scopes: {},
			},
		},
	},
	bearerAuth: {
		type: "http",
		scheme: "bearer",
		bearerFormat: "JWT",
	},
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
	const toolsForClient: Tool[] = Array.from(toolDefinitionMap.values()).map((def) => ({
		name: def.name,
		description: def.description,
		inputSchema: def.inputSchema,
	}));
	return { tools: toolsForClient };
});

server.setRequestHandler(
	CallToolRequestSchema,
	async (request: CallToolRequest): Promise<CallToolResult> => {
		const { name: toolName, arguments: toolArgs } = request.params;
		const toolDefinition = toolDefinitionMap.get(toolName);
		if (!toolDefinition) {
			console.error(`Error: Unknown tool requested: ${toolName}`);
			return { content: [{ type: "text", text: `Error: Unknown tool requested: ${toolName}` }] };
		}
		return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
	},
);

/**
 * Type definition for cached OAuth tokens
 */
interface TokenCacheEntry {
	token: string;
	expiresAt: number;
}

/**
 * Declare global __oauthTokenCache property for TypeScript
 */
declare global {
	var __oauthTokenCache: Record<string, TokenCacheEntry> | undefined;
}

/**
 * Acquires an OAuth2 token using client credentials flow
 *
 * @param schemeName Name of the security scheme
 * @param scheme OAuth2 security scheme
 * @returns Acquired token or null if unable to acquire
 */
async function acquireOAuth2Token(
	schemeName: string,
	scheme: any,
): Promise<string | null | undefined> {
	try {
		// Check if we have the necessary credentials
		const clientId = process.env.OAUTH_CLIENT_ID_SCHEMENAME;
		const clientSecret = process.env.OAUTH_CLIENT_SECRET_SCHEMENAME;
		const scopes = process.env.OAUTH_SCOPES_SCHEMENAME;

		if (!clientId || !clientSecret) {
			console.error(`Missing client credentials for OAuth2 scheme '${schemeName}'`);
			return null;
		}

		// Initialize token cache if needed
		if (typeof global.__oauthTokenCache === "undefined") {
			global.__oauthTokenCache = {};
		}

		// Check if we have a cached token
		const cacheKey = `${schemeName}_${clientId}`;
		const cachedToken = global.__oauthTokenCache[cacheKey];
		const now = Date.now();

		if (cachedToken && cachedToken.expiresAt > now) {
			console.error(
				`Using cached OAuth2 token for '${schemeName}' (expires in ${Math.floor((cachedToken.expiresAt - now) / 1000)} seconds)`,
			);
			return cachedToken.token;
		}

		// Determine token URL based on flow type
		let tokenUrl = "";
		if (scheme.flows?.clientCredentials?.tokenUrl) {
			tokenUrl = scheme.flows.clientCredentials.tokenUrl;
			console.error(`Using client credentials flow for '${schemeName}'`);
		} else if (scheme.flows?.password?.tokenUrl) {
			tokenUrl = scheme.flows.password.tokenUrl;
			console.error(`Using password flow for '${schemeName}'`);
		} else {
			console.error(`No supported OAuth2 flow found for '${schemeName}'`);
			return null;
		}

		// Prepare the token request
		const formData = new URLSearchParams();
		formData.append("grant_type", "client_credentials");

		// Add scopes if specified
		if (scopes) {
			formData.append("scope", scopes);
		}

		console.error(`Requesting OAuth2 token from ${tokenUrl}`);

		// Make the token request
		const response = await axios({
			method: "POST",
			url: tokenUrl,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
			},
			data: formData.toString(),
		});

		// Process the response
		if (response.data?.access_token) {
			const token = response.data.access_token;
			const expiresIn = response.data.expires_in || 3600; // Default to 1 hour

			// Cache the token
			global.__oauthTokenCache[cacheKey] = {
				token,
				expiresAt: now + expiresIn * 1000 - 60000, // Expire 1 minute early
			};

			console.error(
				`Successfully acquired OAuth2 token for '${schemeName}' (expires in ${expiresIn} seconds)`,
			);
			return token;
		}
		console.error(
			`Failed to acquire OAuth2 token for '${schemeName}': No access_token in response`,
		);
		return null;
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(`Error acquiring OAuth2 token for '${schemeName}':`, errorMessage);
		return null;
	}
}

/**
 * Executes an API tool with the provided arguments
 *
 * @param toolName Name of the tool to execute
 * @param definition Tool definition
 * @param toolArgs Arguments provided by the user
 * @param allSecuritySchemes Security schemes from the OpenAPI spec
 * @returns Call tool result
 */
async function executeApiTool(
	toolName: string,
	definition: McpToolDefinition,
	toolArgs: JsonObject,
	allSecuritySchemes: Record<string, any>,
): Promise<CallToolResult> {
	try {
		// Validate arguments against the input schema
		let validatedArgs: JsonObject;
		try {
			const zodSchema = getZodSchemaFromJsonSchema(definition.inputSchema, toolName);
			const argsToParse = typeof toolArgs === "object" && toolArgs !== null ? toolArgs : {};
			validatedArgs = zodSchema.parse(argsToParse);
		} catch (error: unknown) {
			if (error instanceof ZodError) {
				const validationErrorMessage = `Invalid arguments for tool '${toolName}': ${error.errors.map((e) => `${e.path.join(".")} (${e.code}): ${e.message}`).join(", ")}`;
				return { content: [{ type: "text", text: validationErrorMessage }] };
			}
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				content: [
					{ type: "text", text: `Internal error during validation setup: ${errorMessage}` },
				],
			};
		}

		// Prepare URL, query parameters, headers, and request body
		let urlPath = definition.pathTemplate;
		const queryParams: Record<string, any> = {};
		const headers: Record<string, string> = { Accept: "application/json" };
		let requestBodyData: any = undefined;

		// Apply parameters to the URL path, query, or headers
		definition.executionParameters.forEach((param) => {
			const value = validatedArgs[param.name];
			if (typeof value !== "undefined" && value !== null) {
				if (param.in === "path") {
					urlPath = urlPath.replace(`{${param.name}}`, encodeURIComponent(String(value)));
				} else if (param.in === "query") {
					queryParams[param.name] = value;
				} else if (param.in === "header") {
					headers[param.name.toLowerCase()] = String(value);
				}
			}
		});

		// Ensure all path parameters are resolved
		if (urlPath.includes("{")) {
			throw new Error(`Failed to resolve path parameters: ${urlPath}`);
		}

		// Construct the full URL
		const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;

		// Handle request body if needed
		if (definition.requestBodyContentType && typeof validatedArgs.requestBody !== "undefined") {
			requestBodyData = validatedArgs.requestBody;
			headers["content-type"] = definition.requestBodyContentType;
		}

		// Apply security requirements if available
		// Security requirements use OR between array items and AND within each object
		const appliedSecurity = definition.securityRequirements?.find((req) => {
			// Try each security requirement (combined with OR)
			return Object.entries(req).every(([schemeName, scopesArray]) => {
				const scheme = allSecuritySchemes[schemeName];
				if (!scheme) return false;

				// API Key security (header, query, cookie)
				if (scheme.type === "apiKey") {
					return !!process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`];
				}

				// HTTP security (basic, bearer)
				if (scheme.type === "http") {
					if (scheme.scheme?.toLowerCase() === "bearer") {
						return !!process.env[
							`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						];
					}
					if (scheme.scheme?.toLowerCase() === "basic") {
						return (
							!!process.env[
								`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							] &&
							!!process.env[
								`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							]
						);
					}
				}

				// OAuth2 security
				if (scheme.type === "oauth2") {
					// Check for pre-existing token
					if (
						process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`]
					) {
						return true;
					}

					// Check for client credentials for auto-acquisition
					if (
						process.env[
							`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						] &&
						process.env[
							`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
						]
					) {
						// Verify we have a supported flow
						if (scheme.flows?.clientCredentials || scheme.flows?.password) {
							return true;
						}
					}

					return false;
				}

				// OpenID Connect
				if (scheme.type === "openIdConnect") {
					return !!process.env[
						`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
					];
				}

				return false;
			});
		});

		// If we found matching security scheme(s), apply them
		if (appliedSecurity) {
			// Apply each security scheme from this requirement (combined with AND)
			for (const [schemeName, scopesArray] of Object.entries(appliedSecurity)) {
				const scheme = allSecuritySchemes[schemeName];

				// API Key security
				if (scheme?.type === "apiKey") {
					const apiKey =
						process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`];
					if (apiKey) {
						if (scheme.in === "header") {
							headers[scheme.name.toLowerCase()] = apiKey;
							console.error(`Applied API key '${schemeName}' in header '${scheme.name}'`);
						} else if (scheme.in === "query") {
							queryParams[scheme.name] = apiKey;
							console.error(`Applied API key '${schemeName}' in query parameter '${scheme.name}'`);
						} else if (scheme.in === "cookie") {
							// Add the cookie, preserving other cookies if they exist
							headers.cookie = `${scheme.name}=${apiKey}${headers.cookie ? `; ${headers.cookie}` : ""}`;
							console.error(`Applied API key '${schemeName}' in cookie '${scheme.name}'`);
						}
					}
				}
				// HTTP security (Bearer or Basic)
				else if (scheme?.type === "http") {
					if (scheme.scheme?.toLowerCase() === "bearer") {
						const token =
							process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`];
						if (token) {
							headers.authorization = `Bearer ${token}`;
							console.error(`Applied Bearer token for '${schemeName}'`);
						}
					} else if (scheme.scheme?.toLowerCase() === "basic") {
						const username =
							process.env[
								`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							];
						const password =
							process.env[
								`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`
							];
						if (username && password) {
							headers.authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
							console.error(`Applied Basic authentication for '${schemeName}'`);
						}
					}
				}
				// OAuth2 security
				else if (scheme?.type === "oauth2") {
					// First try to use a pre-provided token
					let token =
						process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`];

					// If no token but we have client credentials, try to acquire a token
					if (!token && (scheme.flows?.clientCredentials || scheme.flows?.password)) {
						console.error(`Attempting to acquire OAuth token for '${schemeName}'`);
						token = (await acquireOAuth2Token(schemeName, scheme)) ?? "";
					}

					// Apply token if available
					if (token) {
						headers.authorization = `Bearer ${token}`;
						console.error(`Applied OAuth2 token for '${schemeName}'`);

						// List the scopes that were requested, if any
						const scopes = scopesArray as string[];
						if (scopes && scopes.length > 0) {
							console.error(`Requested scopes: ${scopes.join(", ")}`);
						}
					}
				}
				// OpenID Connect
				else if (scheme?.type === "openIdConnect") {
					const token =
						process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`];
					if (token) {
						headers.authorization = `Bearer ${token}`;
						console.error(`Applied OpenID Connect token for '${schemeName}'`);

						// List the scopes that were requested, if any
						const scopes = scopesArray as string[];
						if (scopes && scopes.length > 0) {
							console.error(`Requested scopes: ${scopes.join(", ")}`);
						}
					}
				}
			}
		}
		// Log warning if security is required but not available
		else if (definition.securityRequirements?.length > 0) {
			// First generate a more readable representation of the security requirements
			const securityRequirementsString = definition.securityRequirements
				.map((req) => {
					const parts = Object.entries(req)
						.map(([name, scopesArray]) => {
							const scopes = scopesArray as string[];
							if (scopes.length === 0) return name;
							return `${name} (scopes: ${scopes.join(", ")})`;
						})
						.join(" AND ");
					return `[${parts}]`;
				})
				.join(" OR ");

			console.warn(
				`Tool '${toolName}' requires security: ${securityRequirementsString}, but no suitable credentials found.`,
			);
		}

		// Prepare the axios request configuration
		const config: AxiosRequestConfig = {
			method: definition.method.toUpperCase(),
			url: requestUrl,
			params: queryParams,
			headers: headers,
			...(requestBodyData !== undefined && { data: requestBodyData }),
		};

		// Log request info to stderr (doesn't affect MCP output)
		console.error(`Executing tool "${toolName}": ${config.method} ${config.url}`);

		// Execute the request
		const response = await axios(config);

		// Process and format the response
		let responseText = "";
		const contentType = response.headers["content-type"]?.toLowerCase() || "";

		// Handle JSON responses
		if (
			contentType.includes("application/json") &&
			typeof response.data === "object" &&
			response.data !== null
		) {
			try {
				responseText = JSON.stringify(response.data, null, 2);
			} catch (e) {
				responseText = "[Stringify Error]";
			}
		}
		// Handle string responses
		else if (typeof response.data === "string") {
			responseText = response.data;
		}
		// Handle other response types
		else if (response.data !== undefined && response.data !== null) {
			responseText = String(response.data);
		}
		// Handle empty responses
		else {
			responseText = `(Status: ${response.status} - No body content)`;
		}

		// Return formatted response
		return {
			content: [
				{
					type: "text",
					text: `API Response (Status: ${response.status}):\n${responseText}`,
				},
			],
		};
	} catch (error: unknown) {
		// Handle errors during execution
		let errorMessage: string;

		// Format Axios errors specially
		if (axios.isAxiosError(error)) {
			errorMessage = formatApiError(error);
		}
		// Handle standard errors
		else if (error instanceof Error) {
			errorMessage = error.message;
		}
		// Handle unexpected error types
		else {
			errorMessage = `Unexpected error: ${String(error)}`;
		}

		// Log error to stderr
		console.error(`Error during execution of tool '${toolName}':`, errorMessage);

		// Return error message to client
		return { content: [{ type: "text", text: errorMessage }] };
	}
}

/**
 * Main function to start the server
 */
async function main() {
	// Set up StreamableHTTP transport
	try {
		await setupStreamableHttpServer(server, 3005);
	} catch (error) {
		console.error("Error setting up StreamableHTTP server:", error);
		process.exit(1);
	}
}

/**
 * Cleanup function for graceful shutdown
 */
async function cleanup() {
	console.error("Shutting down MCP server...");
	process.exit(0);
}

// Register signal handlers
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Start the server
main().catch((error) => {
	console.error("Fatal error in main execution:", error);
	process.exit(1);
});

/**
 * Formats API errors for better readability
 *
 * @param error Axios error
 * @returns Formatted error message
 */
function formatApiError(error: AxiosError): string {
	let message = "API request failed.";
	if (error.response) {
		message = `API Error: Status ${error.response.status} (${error.response.statusText || "Status text not available"}). `;
		const responseData = error.response.data;
		const MAX_LEN = 200;
		if (typeof responseData === "string") {
			message += `Response: ${responseData.substring(0, MAX_LEN)}${responseData.length > MAX_LEN ? "..." : ""}`;
		} else if (responseData) {
			try {
				const jsonString = JSON.stringify(responseData);
				message += `Response: ${jsonString.substring(0, MAX_LEN)}${jsonString.length > MAX_LEN ? "..." : ""}`;
			} catch {
				message += "Response: [Could not serialize data]";
			}
		} else {
			message += "No response body received.";
		}
	} else if (error.request) {
		message = "API Network Error: No response received from server.";
		if (error.code) message += ` (Code: ${error.code})`;
	} else {
		message += `API Request Setup Error: ${error.message}`;
	}
	return message;
}

/**
 * Converts a JSON Schema to a Zod schema for runtime validation
 *
 * @param jsonSchema JSON Schema
 * @param toolName Tool name for error reporting
 * @returns Zod schema
 */
function getZodSchemaFromJsonSchema(jsonSchema: any, toolName: string): z.ZodTypeAny {
	if (typeof jsonSchema !== "object" || jsonSchema === null) {
		return z.object({}).passthrough();
	}
	try {
		const zodSchemaString = jsonSchemaToZod(jsonSchema);
		const zodSchema = eval(zodSchemaString);
		if (typeof zodSchema?.parse !== "function") {
			throw new Error("Eval did not produce a valid Zod schema.");
		}
		return zodSchema as z.ZodTypeAny;
	} catch (err: any) {
		console.error(`Failed to generate/evaluate Zod schema for '${toolName}':`, err);
		return z.object({}).passthrough();
	}
}
