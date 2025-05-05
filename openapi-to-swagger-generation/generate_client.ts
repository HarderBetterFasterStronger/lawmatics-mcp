#!/usr/bin/env bun

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Type definitions
export type TransportMode = 'stdio' | 'web' | 'streamable-http';

export interface ClientOptions {
  input?: string;
  output?: string;
  port?: number;
  transport?: TransportMode;
  serverName?: string | null;
  serverVersion?: string | null;
  baseUrl?: string | null;
  force?: boolean;
}

interface ParsedArgs extends Required<Omit<ClientOptions, 'serverName' | 'baseUrl'>> {
  serverName: string | null;
  baseUrl: string | null;
}

// Default values
const DEFAULT_OUTPUT_DIR = './client';
const DEFAULT_PORT = 3005;
const DEFAULT_TRANSPORT: TransportMode = 'streamable-http';

/**
 * Validate and parse command line arguments
 * @returns Parsed arguments
 */
function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  const parsedArgs: ParsedArgs = {
    input: 'openapi.json',
    output: DEFAULT_OUTPUT_DIR,
    port: DEFAULT_PORT,
    transport: DEFAULT_TRANSPORT,
    serverName: null,
    serverVersion: null,
    baseUrl: null,
    force: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--input' || arg === '-i') {
      parsedArgs.input = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      parsedArgs.output = args[++i];
    } else if (arg === '--port' || arg === '-p') {
      parsedArgs.port = parseInt(args[++i], 10);
    } else if (arg === '--transport' || arg === '-t') {
      // Validate that the transport is one of the allowed values
      const transport = args[++i];
      if (transport === 'stdio' || transport === 'web' || transport === 'streamable-http') {
        parsedArgs.transport = transport;
      } else {
        console.error(`Error: Invalid transport '${transport}'. Must be one of: stdio, web, streamable-http`);
        process.exit(1);
      }
    } else if (arg === '--server-name' || arg === '-n') {
      parsedArgs.serverName = args[++i];
    } else if (arg === '--server-version' || arg === '-v') {
      parsedArgs.serverVersion = args[++i];
    } else if (arg === '--base-url' || arg === '-b') {
      parsedArgs.baseUrl = args[++i];
    } else if (arg === '--force') {
      parsedArgs.force = true;
    }
  }

  // Validate required args
  if (!fs.existsSync(parsedArgs.input)) {
    console.error(`Error: Input file '${parsedArgs.input}' does not exist.`);
    process.exit(1);
  }

  return parsedArgs;
}

/**
 * Modify package.json with the provided scripts and add .env file
 * @param outputDir The client output directory
 */
function modifyGeneratedFiles(outputDir: string): void {
  const packageJsonPath = path.join(outputDir, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`Error: package.json not found at ${packageJsonPath}`);
    return;
  }

  try {
    // Read and modify package.json
    const packageJson: Record<string, any> = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Update scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "start": "node build/index.js",
      "build": "tsc && chmod 755 build/index.js",
      "dev": "tsc --watch && chmod 755 build/index.js",
      "typecheck": "tsc --noEmit",
      "prestart": "npm run build",
      "start:http": "node build/index.js --transport=streamable-http",
      "inspector": "npx @modelcontextprotocol/inspector"
    };

    // Write back the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated scripts in ${packageJsonPath}`);

    // Create .env file with environment variables
    const envContent = `# MCP Server Environment Variables
# Copy this file to .env and fill in the values

# Server configuration
PORT=3005
LOG_LEVEL=info

# No API authentication required
BEARER_TOKEN_BEARERAUTH=YAUcNTu2EnfvkqjnUQScpMvH-AkPVWXOHZ6AogQYbrw

# Add any other environment variables your API might need
`;

    fs.writeFileSync(path.join(outputDir, '.env'), envContent);
    console.log(`Created .env file in ${outputDir}`);

  } catch (error) {
    console.error(`Error modifying generated files: ${error.message}`);
  }
}

/**
 * Run the openapi-mcp-generator command
 * @param options - Configuration options
 * @returns Promise that resolves when client generation is complete
 */
async function generateClient(options: ClientOptions = {}): Promise<void> {
  // Merge command line args with provided options
  const parsedArgs = parseArgs();
  const args = {
    ...parsedArgs,
    ...options
  };

  // Construct command arguments
  const cmdArgs = [
    'npx',
    'openapi-mcp-generator',
    '--input', args.input,
    '--output', args.output,
    '--transport', args.transport,
    '--port', args.port.toString()
  ];

  if (args.serverName) {
    cmdArgs.push('--server-name', args.serverName);
  }

  if (args.serverVersion) {
    cmdArgs.push('--server-version', args.serverVersion);
  }

  if (args.baseUrl) {
    cmdArgs.push('--base-url', args.baseUrl);
  }

  if (args.force) {
    cmdArgs.push('--force');
  }

  console.log(`Generating MCP client with command: ${cmdArgs.join(' ')}`);

  return new Promise<void>((resolve, reject) => {
    const childProcess = spawn(cmdArgs[0], cmdArgs.slice(1), { stdio: 'inherit' });

    childProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Client generation completed successfully`);
        modifyGeneratedFiles(args.output);
        resolve();
      } else {
        console.error(`Client generation failed with code ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    childProcess.on('error', (err) => {
      console.error(`Failed to start child process: ${err}`);
      reject(err);
    });
  });
}

// Run the generator if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // When run from command line, use only command line args
  generateClient({}).catch((err: Error) => {
    console.error(err);
    process.exit(1);
  });
}

export { generateClient };
