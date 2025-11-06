import React, { useState, useEffect } from "react";
import Login from "./Login";
import {
  Server,
  Cloud,
  Layers,
  Database,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// Example data for 10 applications (Your original data - will be replaced by API)
const applications = [
  {
    name: "CSP",
    components: {
      ec2: [
        { name: "cust-web-1", status: "running", cpu: 32, mem: 48, zone: "us-east-1a" },
        { name: "cust-api-1", status: "stopped", cpu: 0, mem: 0, zone: "us-east-1b" },
      ],
      eks: [
        { name: "cust-eks", nodes: 5, pods: 120, status: "healthy", version: "1.28", region: "us-east-1" },
      ],
      ecs: [],
      rds: [
        { name: "cust-db", engine: "Postgres", status: "healthy", cpu: 18, mem: 32, storage: 60, endpoint: "cust-db.xxxx.rds.amazonaws.com" },
        { name: "cust-oracle", engine: "Oracle", status: "healthy", cpu: 22, mem: 40, storage: 80, endpoint: "cust-oracle.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [
        { name: "cust-couch", status: "healthy", cpu: 10, mem: 20, storage: 30, endpoint: "cust-couch.xxxx.couchbase.com" },
      ],
    },
  },
  {
    name: "Kenan Billing",
    components: {
      ec2: [
        { name: "bill-web-1", status: "running", cpu: 44, mem: 60, zone: "us-west-2a" },
      ],
      eks: [],
      ecs: [
        { name: "bill-ecs", services: 4, tasks: 18, status: "healthy", region: "us-west-2" },
      ],
      rds: [
        { name: "bill-db", engine: "Postgres", status: "warning", cpu: 65, mem: 78, storage: 85, endpoint: "bill-db.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [],
    },
  },
  {
    name: "Optima",
    components: {
      ec2: [
        { name: "pay-web-1", status: "running", cpu: 20, mem: 30, zone: "us-east-2a" },
      ],
      eks: [],
      ecs: [],
      rds: [
        { name: "pay-db", engine: "Oracle", status: "healthy", cpu: 10, mem: 15, storage: 20, endpoint: "pay-db.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [],
    },
  },
  {
    name: "CRI-Application",
    components: {
      ec2: [
        { name: "analytics-1", status: "running", cpu: 50, mem: 60, zone: "us-east-1c" },
      ],
      eks: [
        { name: "analytics-eks", nodes: 3, pods: 80, status: "healthy", version: "1.27", region: "us-east-1" },
      ],
      ecs: [],
      rds: [
        { name: "analytics-db", engine: "Postgres", status: "healthy", cpu: 30, mem: 40, storage: 50, endpoint: "analytics-db.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [],
    },
  },
  {
    name: "CRM",
    components: {
      ec2: [
        { name: "crm-web-1", status: "running", cpu: 25, mem: 35, zone: "us-west-1a" },
      ],
      eks: [],
      ecs: [
        { name: "crm-ecs", services: 2, tasks: 10, status: "healthy", region: "us-west-1" },
      ],
      rds: [
        { name: "crm-db", engine: "Oracle", status: "healthy", cpu: 15, mem: 25, storage: 35, endpoint: "crm-db.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [],
    },
  },
  {
    name: "One-Cloud",
    components: {
      ec2: [
        { name: "support-web-1", status: "running", cpu: 18, mem: 28, zone: "us-east-2b" },
      ],
      eks: [],
      ecs: [],
      rds: [
        { name: "support-db", engine: "Postgres", status: "healthy", cpu: 12, mem: 22, storage: 32, endpoint: "support-db.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [],
    },
  },
  {
    name: "Marketing",
    components: {
      ec2: [
        { name: "marketing-web-1", status: "running", cpu: 28, mem: 38, zone: "us-west-2b" },
      ],
      eks: [
        { name: "marketing-eks", nodes: 2, pods: 40, status: "healthy", version: "1.26", region: "us-west-2" },
      ],
      ecs: [],
      rds: [
        { name: "marketing-db", engine: "Postgres", status: "healthy", cpu: 20, mem: 30, storage: 40, endpoint: "marketing-db.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [],
    },
  },
  {
    name: "UREG",
    components: {
      ec2: [
        { name: "inventory-web-1", status: "running", cpu: 35, mem: 45, zone: "us-east-1d" },
      ],
      eks: [],
      ecs: [
        { name: "inventory-ecs", services: 3, tasks: 12, status: "healthy", region: "us-east-1" },
      ],
      rds: [
        { name: "inventory-db", engine: "Couchbase", status: "healthy", cpu: 17, mem: 27, storage: 37, endpoint: "inventory-db.xxxx.couchbase.com" },
      ],
      couchbase: [
        { name: "inventory-couch", status: "healthy", cpu: 9, mem: 19, storage: 29, endpoint: "inventory-couch.xxxx.couchbase.com" },
      ],
    },
  },
  {
    name: "MEC",
    components: {
      ec2: [
        { name: "hr-web-1", status: "running", cpu: 22, mem: 32, zone: "us-west-1b" },
      ],
      eks: [],
      ecs: [],
      rds: [
        { name: "hr-db", engine: "Oracle", status: "healthy", cpu: 11, mem: 21, storage: 31, endpoint: "hr-db.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [],
    },
  },
  {
    name: "Catalog-One",
    components: {
      ec2: [
        { name: "finance-web-1", status: "running", cpu: 40, mem: 50, zone: "us-east-2c" },
      ],
      eks: [],
      ecs: [],
      rds: [
        { name: "finance-db", engine: "Postgres", status: "healthy", cpu: 25, mem: 35, storage: 45, endpoint: "finance-db.xxxx.rds.amazonaws.com" },
      ],
      couchbase: [],
    },
  },
];

function StatusPill({ status }) {
  let config;
  if (status === "healthy" || status === "running") {
    config = {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      icon: <CheckCircle className="w-3 h-3" />
    };
  } else if (status === "warning") {
    config = {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      icon: <AlertCircle className="w-3 h-3" />
    };
  } else {
    config = {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/30",
      icon: <XCircle className="w-3 h-3" />
    };
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.icon}
      {status.toUpperCase()}
    </span>
  );
}

function MetricBar({ label, value, unit = "%" }) {
  const getColor = (val) => {
    if (val < 60) return "bg-emerald-500";
    if (val < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(value)} transition-all duration-500`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

function ComponentCard({ icon, title, bgGradient, children, count }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden hover:border-slate-600 transition-all">
      <div className={`p-4 ${bgGradient} border-b border-slate-700/50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <h3 className="font-bold text-white text-lg">{title}</h3>
              {count !== undefined && (
                <p className="text-xs text-slate-300">{count} instance{count !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

function EC2Card({ instances }) {
  if (!instances || instances.length === 0) {
    return (
      <ComponentCard
        icon={<Server className="w-6 h-6 text-blue-400" />}
        title="EC2 Instances"
        bgGradient="bg-gradient-to-r from-blue-600/20 to-blue-800/20"
        count={0}
      >
        <div className="text-slate-400 text-sm py-4 text-center">No EC2 instances configured</div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard
      icon={<Server className="w-6 h-6 text-blue-400" />}
      title="EC2 Instances"
      bgGradient="bg-gradient-to-r from-blue-600/20 to-blue-800/20"
      count={instances.length}
    >
      <div className="space-y-3">
        {instances.map((instance) => (
          <div key={instance.name} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-white font-semibold">{instance.name}</span>
              <StatusPill status={instance.status} />
            </div>
            <div className="space-y-2">
              <MetricBar label="CPU Usage" value={instance.cpu} />
              <MetricBar label="Memory Usage" value={instance.mem} />
            </div>
            <div className="mt-2 pt-2 border-t border-slate-600/30 text-xs text-slate-400">
              <span>Zone: {instance.zone}</span>
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}

function ClusterCard({ eks, ecs }) {
  const hasEKS = eks && eks.length > 0;
  const hasECS = ecs && ecs.length > 0;

  if (!hasEKS && !hasECS) {
    return (
      <ComponentCard
        icon={<Cloud className="w-6 h-6 text-purple-400" />}
        title="Container Orchestration"
        bgGradient="bg-gradient-to-r from-purple-600/20 to-purple-800/20"
        count={0}
      >
        <div className="text-slate-400 text-sm py-4 text-center">No clusters configured</div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard
      icon={<Cloud className="w-6 h-6 text-purple-400" />}
      title="Container Orchestration"
      bgGradient="bg-gradient-to-r from-purple-600/20 to-purple-800/20"
      count={(eks?.length || 0) + (ecs?.length || 0)}
    >
      <div className="space-y-3">
        {hasEKS && eks.map((cluster) => (
          <div key={cluster.name} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white font-semibold">{cluster.name}</span>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">EKS</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">v{cluster.version} • {cluster.region}</div>
              </div>
              <StatusPill status={cluster.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-xs text-slate-400">Nodes</div>
                <div className="text-lg font-bold text-white">{cluster.nodes}</div>
              </div>
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-xs text-slate-400">Pods</div>
                <div className="text-lg font-bold text-white">{cluster.pods}</div>
              </div>
            </div>
          </div>
        ))}
        {hasECS && ecs.map((cluster) => (
          <div key={cluster.name} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white font-semibold">{cluster.name}</span>
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">ECS</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">{cluster.region}</div>
              </div>
              <StatusPill status={cluster.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-xs text-slate-400">Services</div>
                <div className="text-lg font-bold text-white">{cluster.services}</div>
              </div>
              <div className="bg-slate-800/50 rounded p-2">
                <div className="text-xs text-slate-400">Tasks</div>
                <div className="text-lg font-bold text-white">{cluster.tasks}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}

function DatabaseCard({ rds, couchbase }) {
  const hasRDS = rds && rds.length > 0;
  const hasCouchbase = couchbase && couchbase.length > 0;

  if (!hasRDS && !hasCouchbase) {
    return (
      <ComponentCard
        icon={<Database className="w-6 h-6 text-emerald-400" />}
        title="Databases"
        bgGradient="bg-gradient-to-r from-emerald-600/20 to-emerald-800/20"
        count={0}
      >
        <div className="text-slate-400 text-sm py-4 text-center">No databases configured</div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard
      icon={<Database className="w-6 h-6 text-emerald-400" />}
      title="Databases"
      bgGradient="bg-gradient-to-r from-emerald-600/20 to-emerald-800/20"
      count={(rds?.length || 0) + (couchbase?.length || 0)}
    >
      <div className="space-y-3">
        {hasRDS && rds.map((db) => (
          <div key={db.name} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white font-semibold">{db.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    db.engine === 'Postgres' ? 'bg-blue-500/20 text-blue-300' :
                    db.engine === 'Oracle' ? 'bg-red-500/20 text-red-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {db.engine}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono truncate">{db.endpoint}</div>
              </div>
              <StatusPill status={db.status} />
            </div>
            <div className="space-y-2">
              <MetricBar label="CPU" value={db.cpu} />
              <MetricBar label="Memory" value={db.mem} />
              <MetricBar label="Storage" value={db.storage} />
            </div>
          </div>
        ))}
        {hasCouchbase && couchbase.map((db) => (
          <div key={db.name} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white font-semibold">{db.name}</span>
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">Couchbase</span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono truncate">{db.endpoint}</div>
              </div>
              <StatusPill status={db.status} />
            </div>
            <div className="space-y-2">
              <MetricBar label="CPU" value={db.cpu} />
              <MetricBar label="Memory" value={db.mem} />
              <MetricBar label="Storage" value={db.storage} />
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}

function HealthSummary({ app }) {
  const { ec2, eks, ecs, rds, couchbase } = app.components;
  
  const allComponents = [
    ...(ec2 || []),
    ...(eks || []),
    ...(ecs || []),
    ...(rds || []),
    ...(couchbase || [])
  ];

  const healthyCount = allComponents.filter(c => 
    c.status === 'healthy' || c.status === 'running'
  ).length;
  
  const warningCount = allComponents.filter(c => 
    c.status === 'warning'
  ).length;
  
  const criticalCount = allComponents.filter(c => 
    c.status === 'stopped' || c.status === 'critical'
  ).length;

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl border border-slate-600 p-6 mb-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-lg">
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{app.name}</h2>
            <p className="text-slate-400 text-sm">Component Health Overview</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{healthyCount}</div>
            <div className="text-slate-400 text-sm">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{warningCount}</div>
            <div className="text-slate-400 text-sm">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
            <div className="text-slate-400 text-sm">Critical</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplicationDashboard({ app, onRefresh, lastUpdated, isLoading }) {
  const { ec2, eks, ecs, rds, couchbase } = app.components;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <HealthSummary app={app} />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-lg transition-all disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <EC2Card instances={ec2} />
        <ClusterCard eks={eks} ecs={ecs} />
        <DatabaseCard rds={rds} couchbase={couchbase} />
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedApp, setSelectedApp] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with actual API call to Python backend
  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      // Uncomment when Python backend is ready:
      // const response = await fetch(`http://localhost:8000/api/health/${applications[selectedApp].name}`);
      // const data = await response.json();
      // Update applications[selectedApp].components with data
      
      // Simulate API delay for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealthData();
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedApp]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Enterprise Infrastructure Monitor</h1>
                <p className="text-blue-100 text-sm">PLDT Smart - Real-time DevOps Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-blue-100 text-sm">Welcome back</div>
                <div className="text-white font-semibold">{user}</div>
              </div>
              <button
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/20"
                onClick={() => setUser(null)}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Application Selector - Dropdown Style */}
        <div className="mb-8">
          <label className="block text-slate-300 text-sm font-semibold mb-2">
            Select Application
          </label>
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(Number(e.target.value))}
            className="w-full md:w-96 px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-lg hover:border-slate-600 transition-all"
          >
            {applications.map((app, idx) => (
              <option key={idx} value={idx}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dashboard */}
        <ApplicationDashboard 
          app={applications[selectedApp]} 
          onRefresh={fetchHealthData}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
