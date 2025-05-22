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
		email?: string;
		email_address?: string;
		phone?: string;
		created_at?: string;
		updated_at?: string;
		notes?: string;
		[key: string]: UnknownValue;
	};
	relationships?: Record<string, UnknownValue>;
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

	async getProspect(prospectId: string): Promise<ApiResponse<Prospect>> {
		// Check the cache first
		const cachedProspect = this.prospectCache.get(prospectId) as Prospect;
		if (cachedProspect) {
			return { data: cachedProspect };
		}

		// If not in cache, fetch from API
		const response = await this.makeRequest<ApiResponse<Prospect>>(`/prospects/${prospectId}`);

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

	getStages = async (): Promise<ApiResponse<Stage[]>> =>
		await this.makeRequest<ApiResponse<Stage[]>>("/stages?fields=all");
}
