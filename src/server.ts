import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { name, version } from "../package.json";
import { LawmaticsClientWrapper } from "./client/lawmatics";
import { DocumentTools } from "./tools/documents";
import { FileTools } from "./tools/files";
import { PracticeAreaTools } from "./tools/practice-areas";
import { ProspectTools } from "./tools/prospects";
import { StageTools } from "./tools/stages";
import { TasksTools } from "./tools/tasks";

interface ServerConfig {
	apiToken?: string;
	name?: string;
	version?: string;
}

export function createServer(config: ServerConfig) {
	const { apiToken, name: serverName = name, version: serverVersion = version } = config;

	if (!apiToken) {
		throw new Error("LAWMATICS_API_TOKEN is required");
	}

	const server = new McpServer({
		name: serverName,
		version: serverVersion,
		capabilities: {
			logging: true,
		},
	});

	const client = new LawmaticsClientWrapper(apiToken);

	// Set up the tools
	ProspectTools.create(client, server);
	StageTools.create(client, server);
	PracticeAreaTools.create(client, server);
	FileTools.create(client, server);
	DocumentTools.create(client, server);
	TasksTools.create(client, server);

	return { server, client };
}

export async function startServer(config?: ServerConfig) {
	try {
		// Get config from parameters or environment
		const finalConfig = config || getConfigFromEnv();
		const { server } = createServer(finalConfig);

		const transport = new StdioServerTransport();
		await server.connect(transport);

		console.log(`Lawmatics MCP Server started (${name} v${version})`);
		return server;
	} catch (error) {
		console.error("Fatal:", error);
		process.exit(1);
	}
}

function getConfigFromEnv(): ServerConfig {
	let apiToken = process.env.LAWMATICS_API_TOKEN;

	// Handle command line arguments for backward compatibility
	if (process.argv.length === 3) {
		const [name, token] = String(process.argv[2]).split("=");
		if (name === "LAWMATICS_API_TOKEN") apiToken = token;
	}

	return { apiToken };
}

// Default server instance for backward compatibility
const defaultConfig = getConfigFromEnv();
let defaultServerInstance: { server: McpServer; client: LawmaticsClientWrapper } | null = null;

try {
	defaultServerInstance = createServer(defaultConfig);
} catch (error) {
	// Only fail if we're running as CLI, not when importing as package
	if (import.meta.main || process.argv[1]?.endsWith("index.js")) {
		console.error("Failed to create default server:", error);
		process.exit(1);
	}
}

export default defaultServerInstance?.server;
