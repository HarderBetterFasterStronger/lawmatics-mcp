import FormData from "form-data";
import { Cache } from "./cache";
// Define types for API responses
interface ApiResponse<T> {
	data: T;
	meta?: {
		total?: number;
		limit_per_page?: number;
		total_entries?: number;
	};
	links?: {
		self?: string;
		next?: string;
	};
}

// Define a type for unknown properties that could be any value
export type UnknownValue = string | number | boolean | object | null | undefined;

export interface Prospect {
	id: string;
	type: string;
	attributes?: {
		first_name?: string;
		last_name?: string;
		case_title?: string;
		case_number?: string;
		case_blurb?: string | null;
		status?: string;
		type_of_billing?: string | null;
		name?: string;
		email?: string;
		phone?: string;
		phone_number?: string;
		email_address?: string;
		address?: string | null;
		birthdate?: string | null;
		name_prefix?: string | null;
		middle_name?: string | null;
		name_suffix?: string | null;
		sub_status?: string;
		informal_name?: string | null;
		employer?: string | null;
		occupation?: string | null;
		citizenship?: string | null;
		bio?: string | null;
		title?: string | null;
		hobbies?: string | null;
		social_security?: string | null;
		age?: string | null;
		referring_url?: string | null;
		driver_license?: string | null;
		gender?: string | null;
		marital_status?: string | null;
		timezone?: string | null;
		estimated_value_cents?: number;
		actual_value_cents?: number;
		lead_cost_cents?: number;
		date_of_last_contact?: string;
		days_since_last_contact?: number;
		converted_date?: string | null;
		statute_of_limitations?: string | null;
		utm_source?: string | null;
		utm_campaign?: string | null;
		utm_medium?: string | null;
		utm_term?: string | null;
		gclid?: string | null;
		street?: string | null;
		street2?: string | null;
		city?: string | null;
		state?: string | null;
		zipcode?: string | null;
		country?: string | null;
		full_street?: string | null;
		city_state_zip?: string | null;
		unsubscribed?: boolean;
		full_address?: string | null;
		photo_url?: string | null;
		custom_fields?: Array<{
			id: string;
			name: string;
			field_type: string;
			value: string;
			formatted_value: string;
		}>;
		custom_field_values?: Record<
			string,
			{
				id: string;
				name: string;
				field_type: string;
				value: string;
				formatted_value: string;
			}
		>;
		created_at?: string;
		updated_at?: string;
		last_contacted_date?: string;
		notes?: string;
		[key: string]: UnknownValue;
	};
	relationships?: {
		source?: { data: { id: string; type: string } | null };
		stage?: { data: { id: string; type: string } | null };
		campaign?: { data: { id: string; type: string } | null };
		practice_area?: { data: { id: string; type: string } | null };
		salesperson?: { data: { id: string; type: string } | null };
		lead_attorney?: { data: { id: string; type: string } | null };
		originating_attorney?: { data: { id: string; type: string } | null };
		owned_by?: { data: { id: string; type: string } | null };
		created_by?: { data: { id: string; type: string } | null };
		contact?: { data: { id: string; type: string } | null };
		company?: { data: { id: string; type: string } | null };
		assigned_staff?: { data: Array<{ id: string; type: string }> };
		events?: { data: Array<{ id: string; type: string }> };
		file_requests?: { data: Array<{ id: string; type: string }> };
		documents?: { data: Array<{ id: string; type: string }> };
		files?: { data: Array<{ id: string; type: string }> };
		folders?: { data: Array<{ id: string; type: string }> };
		notes?: { data: Array<{ id: string; type: string }> };
		tasks?: { data: Array<{ id: string; type: string }> };
		emails?: { data: Array<{ id: string; type: string }> };
		phone_numbers?: { data: Array<{ id: string; type: string }> };
		addresses?: { data: Array<{ id: string; type: string }> };
		invoices?: { data: Array<{ id: string; type: string }> };
		tags?: { data: Array<{ id: string; type: string }> };
		relationships?: { data: Array<{ id: string; type: string }> };
		[key: string]: UnknownValue;
	};
	url?: string;
	[key: string]: UnknownValue;
}
export interface TimelineActivity {
	id: string;
	type: "timeline_activity";
	attributes: {
		key: string;
		type: string;
		detail_keys: Record<string, unknown>;
		created_at: string;
		updated_at: string;
	};
	relationships: Record<string, unknown>;
}

interface Stage {
	id: string;
	type: "stage";
	attributes?: {
		name: string;
		color: string;
		order: number;
		created_at?: string;
		updated_at?: string;
	};
	relationships?: Record<string, UnknownValue>;
}

export interface PracticeArea {
	id: string;
	type: string;
	attributes: {
		name: string;
		color: string;
		created_at: string;
		updated_at: string;
	};
}

export interface TaskTag {
	id: number;
	firm_id: number;
	name: string;
	key: string;
	description: string | null;
	color: string;
	created_at: string;
	updated_at: string;
}

export interface RecurrenceRule {
	type: "daily" | "weekly" | "monthly" | "yearly";
	endOption?: boolean;
	endDate?: string;
	frequency?: number;
	sunday?: boolean;
	monday?: boolean;
	tuesday?: boolean;
	wednesday?: boolean;
	thursday?: boolean;
	friday?: boolean;
	saturday?: boolean;
	monthlyFrequency?: number;
	dayOfMonth?: number;
	month?: string;
	dayOfMonthYear?: number;
}

export interface Task {
	id: string;
	type: string;
	attributes: {
		name: string;
		description: string | null;
		due_date: string | null;
		done: boolean;
		priority: string;
		tags: TaskTag[];
		created_at: string;
		updated_at: string;
		recurrence_rule?: RecurrenceRule | null;
		user_ids?: string[];
		taskable_id?: string;
		taskable_type?: string;
		tag_ids?: string[];
		assigned_by_id?: string;
	};
	relationships: {
		users: {
			data: Array<{
				id: string;
				type: string;
			}>;
		};
		taskable: {
			data: {
				id: string;
				type: string;
			} | null;
		};
	};
}

export interface Document {
	id: string;
	type: "file";
	attributes: {
		name: string;
		file_size: string;
		created_at: string;
		updated_at: string;
		folder_id: string | null;
		file_url: string;
		file_name: string;
		file_type: string;
	};
	relationships: {
		documentable: {
			data: {
				id: string;
				type: string;
			};
		};
		parent_folder: {
			data: null;
		};
		folder: {
			data: null;
		};
	};
}

/**
 * This is a thin wrapper over Lawmatics API.
 *
 * Its main reasons for existing are:
 * - Add a caching layer for common calls
 * - Unwrap and simplify some response types
 * - Provide a consistent interface for the MCP tools
 */
export class LawmaticsClientWrapper {
	private baseUrl = "https://api.lawmatics.com/v1";
	private apiToken: string;
	private prospectCache: Cache<string, Prospect>;
	private stageCache: Cache<string, Stage>;

	constructor(apiToken: string) {
		this.apiToken = apiToken;
		this.prospectCache = new Cache();
		this.stageCache = new Cache();
	}

	private async makeRequest<T = Record<string, UnknownValue>>(
		endpoint: string,
		method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
		body?: Record<string, UnknownValue>,
		responseType: "json" | "arraybuffer" | "text" = "json",
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.apiToken}`,
			"Content-Type": "application/json",
		};

		const options: RequestInit = {
			method,
			headers,
		};

		if (body) {
			options.body = JSON.stringify(body);
		}

		try {
			const response = await fetch(url, options);

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			if (responseType === "json") {
				return (await response.json()) as T;
			}
			if (responseType === "arraybuffer") {
				const buffer = await response.arrayBuffer();
				return buffer as unknown as T;
			}
			return (await response.text()) as unknown as T;
		} catch (error) {
			console.error(`Error making request to ${endpoint}:`, error);
			throw error;
		}
	}

	async getProspects(params: { fields?: string } = {}): Promise<ApiResponse<Prospect[]>> {
		if (this.prospectCache.isStale) {
			const queryParams = new URLSearchParams();

			if (params.fields) {
				queryParams.append("fields", params.fields);
			}

			const endpoint = `/prospects${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
			const response = await this.makeRequest<ApiResponse<Prospect[]>>(endpoint);

			if (response && Array.isArray(response.data)) {
				// Cache the prospects
				this.prospectCache.setMany(
					response.data.map((prospect: Prospect) => [prospect.id, prospect]),
				);
			}

			return response;
		}
		// Return the cached prospects
		return {
			data: Array.from(this.prospectCache.values()) as Prospect[],
			meta: {
				total: this.prospectCache.size,
				// Add other meta properties as needed
			},
		};
	}

	// @ts-ignore
	async getProspect(prospectId: string, fields = "all"): Promise<ApiResponse<Prospect>> {
		// Check the cache first
		const cachedProspect = this.prospectCache.get(prospectId) as Prospect;
		if (cachedProspect) {
			return { data: cachedProspect };
		}

		// If not in cache, fetch from API
		const response = await this.makeRequest<ApiResponse<Prospect>>(
			`/prospects/${prospectId}?fields=all`,
		); // for now hard-coding fields

		if (response?.data) {
			// Update the cache
			this.prospectCache.set(prospectId, response.data);
		}

		return response;
	}

	async createProspect(data: Record<string, UnknownValue>): Promise<ApiResponse<Prospect>> {
		const response = await this.makeRequest<ApiResponse<Prospect>>("/prospects", "POST", data);

		if (response?.data) {
			// Update the cache with the new prospect
			this.prospectCache.set(response.data.id, response.data);
		}

		return response;
	}

	async updateProspect(
		prospectId: string,
		data: Record<string, UnknownValue>,
	): Promise<ApiResponse<Prospect>> {
		const response = await this.makeRequest<ApiResponse<Prospect>>(
			`/prospects/${prospectId}`,
			"PUT",
			data,
		);

		if (response?.data) {
			// Update the cache
			this.prospectCache.set(prospectId, response.data);
		}

		return response;
	}

	/**
	 * Delete a prospect/matter from Lawmatics
	 * @param prospectId The ID of the prospect/matter to delete
	 * @returns A promise resolving to an ApiResponse with the deletion result
	 */
	deleteProspect(prospectId: string): Promise<ApiResponse<unknown>> {
		// Remove from cache if it exists
		this.prospectCache.delete(prospectId);
		return this.makeRequest<ApiResponse<unknown>>(`/prospects/${prospectId}`, "DELETE");
	}

	async searchProspects(
		query: string,
		options?: {
			page?: number; // Starting page (defaults to 1)
			limit?: number; // Results per page (defaults to API's default)
			maxPages?: number; // Maximum pages to fetch (defaults to 5)
		},
	): Promise<{
		prospects: Prospect[];
		pagination: {
			currentPage: number;
			totalPages: number;
			totalEntries: number;
			hasMore: boolean;
			tooManyResults: boolean;
		};
	}> {
		const {
			page = 1,
			limit,
			maxPages = 5, // Default max pages to 5
		} = options || {};

		// Initialize results
		let allProspects: Prospect[] = [];
		let currentPage = page;
		let hasMore = true;
		let tooManyResults = false;
		let requestCount = 0;

		// Pagination stats
		let totalPages = 0;
		let totalEntries = 0;

		// Continue fetching pages until we reach the limit
		while (hasMore && currentPage <= maxPages) {
			// Track the number of network requests
			requestCount++;

			const queryParams = new URLSearchParams();
			queryParams.append("q", query);
			queryParams.append("fields", "all");
			queryParams.append("page", currentPage.toString());

			if (limit) {
				queryParams.append("limit", limit.toString());
			}

			const endpoint = `/prospects?${queryParams.toString()}`;
			const response = await this.makeRequest<ApiResponse<Prospect[]>>(endpoint);

			// Add the current page's prospects to our results
			if (response?.data) {
				allProspects = [...allProspects, ...response.data];
			}

			// Update pagination info from response metadata
			if (response?.meta) {
				totalPages = response.meta.total_pages || 0;
				totalEntries = response.meta.total_entries || 0;
			}

			// Check if there are more pages
			hasMore = !!response?.links?.next && currentPage < totalPages;
			currentPage++;

			// If we've reached our max request limit but there are still more pages
			if (requestCount >= maxPages && hasMore) {
				tooManyResults = true;
				break;
			}
		}

		return {
			prospects: allProspects,
			pagination: {
				currentPage: currentPage - 1, // Return the last page we actually fetched
				totalPages,
				totalEntries,
				hasMore,
				tooManyResults,
			},
		};
	}

	/**
	 * Find a prospect by name using fuzzy search (case-insensitive)
	 * @param name First name, last name, or both
	 * @returns The closest matching prospect
	 */
	async findProspectByName(name: string): Promise<ApiResponse<Prospect>> {
		const encodedName = encodeURIComponent(name);
		const endpoint = `/prospects/find_by_name/${encodedName}?fields=all`;

		const response = await this.makeRequest<ApiResponse<Prospect>>(endpoint);

		if (response?.data) {
			// Update the cache with the found prospect
			this.prospectCache.set(response.data.id, response.data);
		}

		return response;
	}

	/**
	 * Find a prospect by email address using fuzzy search
	 * @param email Email address to search for
	 * @returns The closest matching prospect
	 */
	async findProspectByEmail(email: string): Promise<ApiResponse<Prospect>> {
		const encodedEmail = encodeURIComponent(email);
		const endpoint = `/prospects/find_by_email/${encodedEmail}?fields=all`;

		const response = await this.makeRequest<ApiResponse<Prospect>>(endpoint);

		if (response?.data) {
			// Update the cache with the found prospect
			this.prospectCache.set(response.data.id, response.data);
		}

		return response;
	}

	/**
	 * Find a prospect by name using fuzzy search (case-insensitive)
	 * @param matterId
	 * @returns A list of timeline activities for the matter
	 */
	async findTimelineActivitiesForProspect(
		matterId: string,
	): Promise<ApiResponse<TimelineActivity[]>> {
		const endpoint = `/activities?filter_by=matter_id&filter_on=${matterId}`;
		const response = await this.makeRequest<ApiResponse<TimelineActivity[]>>(endpoint);

		return response;
	}

	/**
	 * Find a prospect by name using fuzzy search (case-insensitive)
	 * @param matterId
	 * @returns A list of timeline activities for the matter
	 */
	async findTimelineActivity(activityId: string): Promise<ApiResponse<Prospect>> {
		const endpoint = `/activities/${activityId}`;
		const response = await this.makeRequest<ApiResponse<Prospect>>(endpoint);

		return response;
	}

	/**
	 * Find a prospect by phone number using fuzzy search
	 * @param phoneNumber Any valid phone number (digits will be stripped for matching)
	 * @returns The closest matching prospect
	 */
	async findProspectByPhone(phoneNumber: string): Promise<ApiResponse<Prospect>> {
		const encodedPhone = encodeURIComponent(phoneNumber);
		const endpoint = `/prospects/find_by_phone/${encodedPhone}?fields=all`;

		const response = await this.makeRequest<ApiResponse<Prospect>>(endpoint);

		if (response?.data) {
			// Update the cache with the found prospect
			this.prospectCache.set(response.data.id, response.data);
		}

		return response;
	}

	/**
	 * Find prospects by case title using filter
	 * @param caseTitle Case title to search for
	 * @returns Prospects matching the case title
	 */
	async findProspectByCaseTitle(caseTitle: string): Promise<ApiResponse<Prospect[]>> {
		const queryParams = new URLSearchParams();
		queryParams.append("filter_by", "case_title");
		queryParams.append("filter_on", caseTitle);
		queryParams.append("filter_with", "ilike");
		queryParams.append("fields", "all");

		const endpoint = `/prospects?${queryParams.toString()}`;
		const response = await this.makeRequest<ApiResponse<Prospect[]>>(endpoint);

		// For case title searches, we might get multiple results
		// so we don't update the cache like with the single-result endpoints

		return response;
	}

	async getStage(stageId: string): Promise<ApiResponse<Stage>> {
		const cachedStage = this.stageCache.get(stageId) as Stage;
		if (cachedStage) {
			return { data: cachedStage };
		}

		const response = await this.makeRequest<ApiResponse<Stage>>(`/stages/${stageId}?fields=all`);

		if (response?.data) {
			this.stageCache.set(stageId, response.data);
		}

		return response;
	}

	getStages = async (): Promise<ApiResponse<Stage[]>> =>
		await this.makeRequest<ApiResponse<Stage[]>>("/stages?fields=all");

	/**
	 * Get all practice areas
	 * @param page Page number for pagination (1-based)
	 * @param perPage Number of items per page
	 */
	async getPracticeAreas(page = 1, perPage = 25): Promise<ApiResponse<PracticeArea[]>> {
		const queryParams = new URLSearchParams({
			page: page.toString(),
			per_page: perPage.toString(),
		});

		const endpoint = `/practice_areas?${queryParams.toString()}`;
		const response = await this.makeRequest<ApiResponse<PracticeArea[]>>(endpoint);

		return response;
	}

	/**
	 * Get a specific practice area by ID
	 * @param practiceAreaId The ID of the practice area to retrieve
	 */
	async getPracticeArea(practiceAreaId: string): Promise<ApiResponse<PracticeArea>> {
		const response = await this.makeRequest<ApiResponse<PracticeArea>>(
			`/practice_areas/${practiceAreaId}`,
		);

		return response;
	}

	/**
	 * Get a list of tasks with optional filtering
	 * @param params Filtering parameters
	 * @returns List of tasks with pagination info
	 */
	async getTasks(
		params: {
			matter_id?: string;
			prospect_id?: string;
			contact_id?: string;
			company_id?: string;
			client_id?: string;
			user_id?: string;
			fields?: string;
			page?: number;
			limit?: number;
		} = {},
	): Promise<ApiResponse<Task[]>> {
		const queryParams = new URLSearchParams();

		// Add optional filters
		if (params.matter_id) queryParams.append("matter_id", params.matter_id);
		if (params.prospect_id) queryParams.append("prospect_id", params.prospect_id);
		if (params.contact_id) queryParams.append("contact_id", params.contact_id);
		if (params.company_id) queryParams.append("company_id", params.company_id);
		if (params.client_id) queryParams.append("client_id", params.client_id);
		if (params.user_id) queryParams.append("user_id", params.user_id);

		// Add pagination and fields
		queryParams.append("fields", params.fields || "all");
		if (params.page) queryParams.append("page", params.page.toString());
		if (params.limit) queryParams.append("limit", params.limit.toString());

		const endpoint = `/tasks?${queryParams.toString()}`;
		return this.makeRequest<ApiResponse<Task[]>>(endpoint);
	}

	/**
	 * Create a new task
	 * @param taskData Task data including name and other optional fields
	 * @returns The created task
	 */
	async createTask(taskData: {
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
	}): Promise<ApiResponse<Task>> {
		const endpoint = "/tasks";

		// Prepare the request body
		const requestBody: {
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
			name: taskData.name,
		};

		// Add optional fields if they exist
		if (taskData.description !== undefined) requestBody.description = taskData.description;
		if (taskData.due_date !== undefined) requestBody.due_date = taskData.due_date;
		if (taskData.user_ids !== undefined) requestBody.user_ids = taskData.user_ids;
		if (taskData.priority !== undefined) requestBody.priority = taskData.priority;
		if (taskData.done !== undefined) requestBody.done = taskData.done;
		if (taskData.taskable_type !== undefined) requestBody.taskable_type = taskData.taskable_type;
		if (taskData.taskable_id !== undefined) requestBody.taskable_id = taskData.taskable_id;
		if (taskData.tag_ids !== undefined) requestBody.tag_ids = taskData.tag_ids;
		if (taskData.assigned_by_id !== undefined) requestBody.assigned_by_id = taskData.assigned_by_id;
		if (taskData.recurrence_rule !== undefined)
			requestBody.recurrence_rule = taskData.recurrence_rule;

		return this.makeRequest<ApiResponse<Task>>(endpoint, "POST", requestBody);
	}

	/**
	 * Retrieve all documents for a given prospect (matter).
	 * @param prospectId The ID of the prospect (matter) to fetch documents for.
	 * @returns A promise resolving to an ApiResponse containing an array of Document objects.
	 *
	 * Usage:
	 *   const docs = await client.getDocuments(prospectId);
	 */
	async getDocuments(prospectId: string) {
		const response = await this.makeRequest<ApiResponse<Document[]>>(
			`/files?filter_by=matter_id&filter_on=${prospectId}`,
		);
		return response;
	}

	/**
	 * Retrieve metadata for a specific document by file ID.
	 * @param fileId The ID of the file/document to fetch metadata for.
	 * @returns A promise resolving to an ApiResponse containing a single Document object.
	 *
	 * Usage:
	 *   const docMeta = await client.getDocumentMetaData(fileId);
	 */
	async getDocumentMetaData(fileId: string) {
		const response = await this.makeRequest<ApiResponse<Document>>(`/files/${fileId}?fields=all`);
		return response;
	}

	/**
	 * Download a document by file ID.
	 * @param fileId The ID of the file/document to download.
	 * @returns A promise resolving to an ApiResponse containing the Document object with download information.
	 *
	 * Usage:
	 *   const downloadInfo = await client.downloadDocument(fileId);
	 */
	async downloadDocument(fileId: string) {
		// Use arraybuffer responseType to handle binary data
		const buffer = await this.makeRequest<ArrayBuffer>(
			`/files/download/${fileId}`,
			"GET",
			undefined,
			"arraybuffer",
		);
		return { data: buffer };
	}

	/**
	 * Upload a file to Lawmatics
	 * @param filePath Path to the file to upload
	 * @param documentableType Type of entity to attach the file to (firm, client, matter, contact)
	 * @param documentableId ID of the entity (not required for firm)
	 * @param options Additional options (name, folderId, path)
	 */
	async uploadFile(
		fileBuffer: Buffer,
		fileName: string,
		documentableType: "firm" | "client" | "matter" | "contact" = "firm",
		documentableId?: string,
		options?: {
			name?: string;
			folderId?: string;
			path?: string[];
		},
	): Promise<Record<string, unknown>> {
		const url = `${this.baseUrl}/files`;
		// Use require to avoid import dependency issues
		const form = new FormData();

		// Add form fields
		form.append("documentable_type", documentableType);
		if (documentableId) form.append("documentable_id", documentableId);
		if (options?.name) form.append("name", options.name);
		if (options?.folderId) form.append("folder_id", options.folderId);
		if (options?.path && Array.isArray(options.path)) {
			form.append("path", JSON.stringify(options.path));
		}

		// Add file last
		form.append("file", fileBuffer, fileName);

		return new Promise((resolve, reject) => {
			// Import types inline
			const https = require("node:https");
			const { IncomingMessage } = require("node:http");
			const urlObj = new URL(url);

			// Configure request
			const headers = form.getHeaders();
			headers.Authorization = `Bearer ${this.apiToken}`;

			const options = {
				method: "POST",
				headers,
				hostname: urlObj.hostname,
				path: urlObj.pathname,
			};

			// Create request
			const req = https.request(options, (res: typeof IncomingMessage) => {
				let data = "";

				res.on("data", (chunk: Buffer) => {
					data += chunk;
				});

				res.on("end", () => {
					if (res.statusCode >= 200 && res.statusCode < 300) {
						try {
							resolve(JSON.parse(data));
						} catch (e: unknown) {
							const error = e instanceof Error ? e : new Error(String(e));
							reject(new Error(`Failed to parse response: ${error.message}`));
						}
					} else {
						reject(new Error(`API request failed with status ${res.statusCode}: ${data}`));
					}
				});
			});

			req.on("error", (e: Error) => reject(new Error(`Request error: ${e.message}`)));

			// Send the form data
			form.pipe(req);
		});
	}
}
