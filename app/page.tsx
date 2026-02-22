import { Flask } from 'lucide-react';

export default function Home() {
  const tools = [
    { name: 'get_all', description: 'Get all items', icon: Flask, params: [] },
    { name: 'get_by_id', description: 'Get item by ID', icon: Flask, params: ['id (required)'] },
    { name: 'search', description: 'Search items', icon: Flask, params: ['query (required)'] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
              <Flask className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Lab Experiments</h1>
              <p className="text-sm text-slate-400">Portfolio Showcase</p>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400"></span>
            <span className="text-sm text-cyan-300">MCP-Enabled Server</span>
          </div>
          <h2 className="mb-6 text-5xl font-bold text-white">Lab Experiments</h2>
          <p className="mb-8 text-lg text-slate-300">Your comprehensive Lab Experiments with MCP integration.</p>
          <a href="/api/mcp" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-3 font-medium text-white transition-all hover:from-cyan-600 hover:to-cyan-700">
            <Flask className="h-4 w-4" /> MCP Endpoint
          </a>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <div className="mb-10 text-center">
          <h3 className="mb-4 text-3xl font-bold text-white">Available MCP Tools</h3>
        </div>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.name} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-slate-800/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20">
                  <Icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h4 className="mb-2 font-semibold text-white">{tool.name}</h4>
                <p className="mb-4 text-sm text-slate-400">{tool.description}</p>
                {tool.params.length > 0 && tool.params.map((param) => (
                  <code key={param} className="block rounded bg-slate-900/50 px-2 py-1 text-xs text-cyan-300">{param}</code>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-700/50">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-sm text-slate-500">Part of the bookchaowalit portfolio ecosystem</p>
        </div>
      </footer>
    </div>
  );
}
