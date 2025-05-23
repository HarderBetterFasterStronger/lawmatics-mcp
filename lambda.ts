// AWS Lambda handler using MCP server adapter
'use strict';

exports.handler = async (event, context) => {
  // Dynamically import the adapter
  const { stdioServerAdapter } = await import('@aws/run-mcp-servers-with-aws-lambda');

  // Define our MCP server process
  const serverParams = {
    command: '/var/lang/bin/node',
    args: ['./index.js'],
    env: {
      LAWMATICS_API_TOKEN: process.env.LAWMATICS_API_TOKEN || ''
    }
  };

  // Let the adapter handle everything
  return await stdioServerAdapter(serverParams, event, context);
}