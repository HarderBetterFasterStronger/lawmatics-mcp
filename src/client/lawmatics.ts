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

			return (await response.json()) as T;
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

	async searchProspects(query: string): Promise<ApiResponse<Prospect[]>> {
		// This is a simplified implementation - in reality you'd probably
		// need to use a specific search endpoint or filter the results
		const queryParams = new URLSearchParams();
		queryParams.append("q", query);

		const endpoint = `/prospects?${queryParams.toString()}`;
		const response = await this.makeRequest<ApiResponse<Prospect[]>>(endpoint);

		return response;
	}

	/**
	 * Find a prospect by name using fuzzy search (case-insensitive)
	 * @param name First name, last name, or both
	 * @returns The closest matching prospect
	 */
	async findProspectByName(name: string): Promise<ApiResponse<Prospect>> {
		const encodedName = encodeURIComponent(name);
		const endpoint = `/prospects/find_by_name/${encodedName}`;

		const response = await this.makeRequest<ApiResponse<Prospect>>(endpoint);

		if (response?.data) {
			// Update the cache with the found prospect
			this.prospectCache.set(response.data.id, response.data);
		}

		return response;
	}

	/**
	 * Find a prospect by phone number using fuzzy search
	 * @param phoneNumber Any valid phone number (digits will be stripped for matching)
	 * @returns The closest matching prospect
	 */
	async findProspectByPhone(phoneNumber: string): Promise<ApiResponse<Prospect>> {
		const encodedPhone = encodeURIComponent(phoneNumber);
		const endpoint = `/prospects/find_by_phone/${encodedPhone}`;

		const response = await this.makeRequest<ApiResponse<Prospect>>(endpoint);

		if (response?.data) {
			// Update the cache with the found prospect
			this.prospectCache.set(response.data.id, response.data);
		}

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
}
