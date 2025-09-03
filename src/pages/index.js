// pages/composio-demo.js
import { useState } from 'react';
import { Composio } from "@composio/core";

export default function ComposioDemo() {
  const [apiKey, setApiKey] = useState('');
  const [appName, setAppName] = useState('linear');
  const [actionName, setActionName] = useState('');
  const [actionParams, setActionParams] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectedApps, setConnectedApps] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);

  // Initialize Composio client
  const getComposioClient = () => {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    return new Composio({ apiKey });
  };

  // Get user's connected apps
  // Get user's connected apps using connectedAccounts.list()
  const getConnectedApps = async () => {
    setLoading(true);
    try {
      const composio = getComposioClient();
      const accountsResp = await composio.connectedAccounts.list();
      // Log the response for debugging
      console.log('connectedAccounts.list() response:', accountsResp);
      let accounts = [];
      if (Array.isArray(accountsResp)) {
        accounts = accountsResp;
      } else if (accountsResp && Array.isArray(accountsResp.items)) {
        accounts = accountsResp.items;
      } else if (accountsResp && Array.isArray(accountsResp.data)) {
        accounts = accountsResp.data;
      } else if (accountsResp && accountsResp.results && Array.isArray(accountsResp.results)) {
        accounts = accountsResp.results;
      }
      setConnectedApps(accounts);
      setResult(`Found ${accounts.length} connected apps`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get available actions for an app
  // Get available actions for an app using tools.getRawComposioTools
  const getActions = async () => {
    if (!appName) return;
    setLoading(true);
    try {
      const composio = getComposioClient();
      // Get all tools for the selected app/toolkit
      const tools = await composio.tools.getRawComposioTools({ toolkits: [appName] });
      // Log the full tools response for debugging
      console.log('getRawComposioTools response:', tools);
      // Each item in tools is already an action object
      let actions = [];
      if (Array.isArray(tools)) {
        actions = tools;
      }
      setAvailableActions(actions);
      setResult(`Found ${actions.length} actions for ${appName}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Execute an action
  const executeAction = async () => {
    if (!actionName) return;
    setLoading(true);
    try {
      const composio = getComposioClient();
      let params = {};
      try {
        params = actionParams ? JSON.parse(actionParams) : {};
      } catch (e) {
        setResult("Error: Parameters must be valid JSON");
        return;
      }
      // Find the selected action object by name
      const selectedAction = availableActions.find(a => a.name === actionName);
      if (!selectedAction) {
        setResult("Error: Action not found");
        return;
      }
      // Use the action's slug to execute
      const response = await composio.tools.execute(selectedAction.slug, params);
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Composio Integration Demo</h1>
      <p>This demo shows how to integrate Composio with Next.js to connect to tools like Linear and Notion.</p>
      
      <div style={{ marginBottom: 20 }}>
        <h2>1. API Configuration</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Enter your Composio API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
          />
          <button 
            onClick={getConnectedApps}
            disabled={!apiKey || loading}
            style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Get Connected Apps
          </button>
        </div>
      </div>

      {connectedApps.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2>2. Select App</h2>
          <select 
            value={appName} 
            onChange={(e) => setAppName(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
          >
            <option value="">Select an app</option>
            {connectedApps.map((app, index) => (
              <option key={index} value={app.appName}>
                {app.appName}
              </option>
            ))}
          </select>
          
          <button 
            onClick={getActions}
            disabled={!appName || loading}
            style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Get Actions
          </button>
        </div>
      )}

      {availableActions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2>3. Execute Action</h2>
          <select 
            value={actionName} 
            onChange={(e) => setActionName(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 10 }}
          >
            <option value="">Select an action</option>
            {availableActions.map((action, index) => (
              <option key={index} value={action.name}>
                {action.name} - {action.description}
              </option>
            ))}
          </select>
          
          <textarea
            placeholder="Action parameters (JSON)"
            value={actionParams}
            onChange={(e) => setActionParams(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 8, marginBottom: 10, border: '1px solid #ddd', borderRadius: 4 }}
          />
          
          <button 
            onClick={executeAction}
            disabled={!actionName || loading}
            style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Execute Action
          </button>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h2>Result</h2>
        {loading ? (
          <p>Loading...</p>
        ) : result ? (
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: 15, 
            borderRadius: 4, 
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {result}
          </pre>
        ) : (
          <p style={{ color: '#666' }}>Results will appear here after executing an action.</p>
        )}
      </div>

      <div style={{ padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
        <h2>How to Set Up Composio</h2>
        <ol>
          <li>Sign up for a Composio account at <a href="https://composio.dev" target="_blank">composio.dev</a></li>
          <li>Get your API key from the dashboard</li>
          <li>Connect apps (Linear, Notion, etc.) through the Composio interface</li>
          <li>Use the API key in your Next.js application</li>
        </ol>
        
        <h3>Example: Creating a Linear Issue</h3>
        <p>For Linear, you might use the <code>create_issue</code> action with parameters like:</p>
        <pre>
          {`{
  "title": "New Task",
  "description": "Task description here",
  "teamId": "your-team-id"
}`}
        </pre>
      </div>
    </div>
  );
}