import { LawmaticsClientWrapper } from "@/client/lawmatics";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { name, version } from "../package.json";

import { FileTools } from "./tools/files";
import { PracticeAreaTools } from "./tools/practice-areas";
import { ProspectTools } from "./tools/prospects";
import { StageTools } from "./tools/stages";

let apiToken = process.env.LAWMATICS_API_TOKEN;

// If a LAWMATICS_API_TOKEN is provided as an argument, use it instead of the environment variable.
if (process.argv.length === 3) {
	const [name, token] = String(process.argv[2]).split("=");
	if (name === "LAWMATICS_API_TOKEN") apiToken = token;
}

if (!apiToken) {
	console.error("LAWMATICS_API_TOKEN is required");
	process.exit(1);
}

const server = new McpServer({
	name,
	version,
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

async function startServer() {
	try {
		const transport = new StdioServerTransport();
		await server.connect(transport);
	} catch (error) {
		console.error("Fatal:", error);
		process.exit(1);
	}
}

startServer();
