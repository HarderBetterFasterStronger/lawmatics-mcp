import {
  LambdaFunctionParameters,
  LambdaFunctionClientTransport,
} from "@aws/run-mcp-servers-with-aws-lambda";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

async function main() {
  const serverParams: LambdaFunctionParameters = {
    functionName: "lawmatics-mcp-LawmaticsMcpFunction-XxqaVbh1djpR",
    regionName: "us-west-1",
  };
  
  const client = new Client(
    {
      name: "my-client",
      version: "0.0.1",
    },
    {
      capabilities: {
        sampling: {},
      },
    }
  );
  
  try {
    console.log('Connecting to Lambda function:', serverParams);
    const transport = new LambdaFunctionClientTransport(serverParams);
    await client.connect(transport);
    // List available tools first to see what's available
    console.log('Listing available tools...');
    const toolsList = await client.listTools();
    console.log('Available tools:', toolsList);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
