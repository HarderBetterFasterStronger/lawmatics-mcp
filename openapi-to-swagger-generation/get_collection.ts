import { fetch } from "bun";
import fs from "fs";
import { generateClient } from "./generate_client";
import type { ClientOptions } from "./generate_client";

// Define interfaces for the API responses and OpenAPI structure
interface CollectionResponse {
    output: string;
    [key: string]: any;
}

interface OpenAPIComponents {
    securitySchemes?: Record<string, any>;
    [key: string]: any;
}

interface OpenAPISpec {
    components?: OpenAPIComponents;
    security?: Array<Record<string, any[]>>;
    [key: string]: any;
}


async function getCollectionJSON(): Promise<CollectionResponse> {
    const res = await fetch(`https://api.getpostman.com/collections/${process.env.POSTMAN_COLLECTION_UID}/transformations`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.POSTMAN_API_KEY || (() => { throw new Error("Missing POSTMAN_API_KEY"); })(),
        },
    });
    return await res.json();
}

async function main(): Promise<void> {
    const collectionJSON = await getCollectionJSON();
    const openapi: OpenAPISpec = JSON.parse(collectionJSON.output);
    fs.writeFileSync("postman_collection_transformed.json", JSON.stringify(openapi, null, 2));

    // Add security scheme for JWT Bearer authentication
    if (!openapi.components) {
        openapi.components = {};
    }


    openapi.components.securitySchemes = {
        ...openapi.components.securitySchemes,
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT" // optional, arbitrary value for documentation purposes
        }
    };

    // Apply security globally to all operations
    openapi.security = [
        ...(openapi.security || []),
        { bearerAuth: [] }
    ];

    fs.writeFileSync("openapi.json", JSON.stringify(openapi, null, 2));

    // Generate MCP client using the openapi-mcp-generator
    console.log("Generating MCP client from OpenAPI specification...");
    try {
        // Pass options object to configure the client generation
        const clientOptions: ClientOptions = {
            input: "openapi.json",
            output: "./new_client",
            transport: "streamable-http",
            port: 3005,
            baseUrl: "https://api.lawmatics.com",

            // package.json:name
            serverName: "@lawmatics/mcp",

            // package.json:version
            serverVersion: "1.0.0",
            force: true
        };
        await generateClient(clientOptions);
        console.log("MCP client generation completed successfully.");
    } catch (error: unknown) {
        console.error("Failed to generate MCP client:", error instanceof Error ? error.message : error);
    }
}
main()


