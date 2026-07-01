import asyncio
import json
from server import server

# Test the MCP server
async def test_server():
    print("Testing Viral Trend Scraper MCP Server")
    print("=" * 50)
    
    # List available tools
    tools = await server.list_tools()
    print(f"\nAvailable tools ({len(tools)}):")
    for tool in tools:
        print(f"  - {tool.name}: {tool.description}")
    
    print("\n" + "=" * 50)
    print("To use this server:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Set up platform credentials in .env")
    print("3. Run: python server.py")
    print("4. Configure MCP client to connect to this server")

if __name__ == "__main__":
    asyncio.run(test_server())
