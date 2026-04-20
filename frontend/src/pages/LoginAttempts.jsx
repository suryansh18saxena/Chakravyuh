import { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Shield, AlertTriangle, User, Key, Globe, Clock, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = `http://${window.location.hostname}:3001`;

export default function LoginAttempts() {
  const { socket } = useGlobal();
  const [attacks, setAttacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchLoginAttacks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/attacks/login`);
      const data = await res.json();
      setAttacks(data);
    } catch (err) {
      console.error('Failed to fetch login attacks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginAttacks();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      if (payload?.surface === 'login') {
        setAttacks(prev => [payload, ...prev].slice(0, 50));
      }
    };
    socket.on('new_attack', handler);
    return () => socket.off('new_attack', handler);
  }, [socket]);

  // Extract credentials from body
  const parseCredentials = (bodyStr) => {
    try {
      const body = JSON.parse(bodyStr || '{}');
      return {
        username: body.username || body.user || body.email || body.login || '—',
        password: body.password || body.pass || body.pwd || '—'
      };
    } catch {
      return { username: '—', password: '—' };
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-cyber-critical-bg text-cyber-critical-text border-cyber-critical-border';
      case 'High': return 'bg-cyber-high-bg text-cyber-high-text border-cyber-high-border';
      case 'Medium': return 'bg-cyber-medium-bg text-cyber-medium-text border-cyber-medium-border';
      default: return 'bg-cyber-low-bg text-cyber-low-text border-cyber-low-border';
    }
  };

  const summaryStats = {
    total: attacks.length,
    critical: attacks.filter(a => a.severity === 'Critical').length,
    uniqueIPs: new Set(attacks.map(a => a.session?.attacker?.ip)).size,
    countries: new Set(attacks.map(a => a.session?.attacker?.country).filter(Boolean)).size,
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-cyber-accent-red/10 border border-cyber-accent-red/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-cyber-accent-red" />
          </div>
          <div>
            <h1 className="page-title text-white">Login Attempts</h1>
            <p className="text-cyber-text-secondary text-sm mt-0.5">
              Credentials and payloads hackers submitted to the exposed <code className="px-1.5 py-0.5 bg-cyber-elevated rounded text-cyber-accent-warning font-mono text-xs">/login</code> honeypot endpoint
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="cyber-card flex flex-col items-center py-5">
          <Shield className="w-6 h-6 text-cyber-accent-blue mb-2" />
          <span className="font-heading text-3xl font-bold text-white">{summaryStats.total}</span>
          <span className="text-cyber-text-secondary text-xs mt-1">Total Attempts</span>
        </div>
        <div className="cyber-card flex flex-col items-center py-5">
          <AlertTriangle className="w-6 h-6 text-cyber-accent-red mb-2" />
          <span className="font-heading text-3xl font-bold text-cyber-accent-red">{summaryStats.critical}</span>
          <span className="text-cyber-text-secondary text-xs mt-1">Critical</span>
        </div>
        <div className="cyber-card flex flex-col items-center py-5">
          <User className="w-6 h-6 text-cyber-accent-warning mb-2" />
          <span className="font-heading text-3xl font-bold text-white">{summaryStats.uniqueIPs}</span>
          <span className="text-cyber-text-secondary text-xs mt-1">Unique IPs</span>
        </div>
        <div className="cyber-card flex flex-col items-center py-5">
          <Globe className="w-6 h-6 text-cyber-accent-success mb-2" />
          <span className="font-heading text-3xl font-bold text-white">{summaryStats.countries}</span>
          <span className="text-cyber-text-secondary text-xs mt-1">Countries</span>
        </div>
      </div>

      {/* Attacks Table */}
      <div className="cyber-card !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-cyber-border flex items-center justify-between">
          <h2 className="section-header text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyber-accent-red" />
            Captured Login Submissions
          </h2>
          <span className="font-mono text-xs text-cyber-text-secondary">{attacks.length} records</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyber-accent-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : attacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-cyber-text-secondary">
            <Shield className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-heading">No login attempts captured yet</p>
            <p className="text-sm mt-1">Try accessing <code className="px-1.5 py-0.5 bg-cyber-elevated rounded font-mono text-xs">http://localhost:8080/login</code> with credentials</p>
          </div>
        ) : (
          <div className="divide-y divide-cyber-border">
            {attacks.map((attack, idx) => {
              const creds = parseCredentials(attack.body);
              const attacker = attack.session?.attacker;
              const isExpanded = expandedId === attack.id;
              const rules = (() => { try { return JSON.parse(attack.matchedRules || '[]'); } catch { return []; } })();
              const ts = new Date(attack.timestamp).toLocaleString();

              return (
                <motion.div
                  key={attack.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div
                    className="px-5 py-4 hover:bg-cyber-elevated/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : attack.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Severity Badge */}
                        <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${getSeverityStyle(attack.severity)}`}>
                          {attack.severity}
                        </span>

                        {/* Credentials */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-cyber-accent-warning shrink-0" />
                            <span className="font-mono text-sm text-white truncate">{creds.username}</span>
                            <span className="text-cyber-text-secondary text-xs">/</span>
                            <Key className="w-3.5 h-3.5 text-cyber-accent-red shrink-0" />
                            <span className="font-mono text-sm text-cyber-accent-red truncate">{creds.password}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Globe className="w-3 h-3 text-cyber-text-secondary shrink-0" />
                            <span className="font-mono text-[11px] text-cyber-text-secondary truncate">
                              {attacker?.ip || '—'} • {attacker?.country || '—'} • {attacker?.city || '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1.5 text-cyber-text-secondary">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-mono text-[11px]">{ts}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-cyber-text-secondary" /> : <ChevronDown className="w-4 h-4 text-cyber-text-secondary" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Raw Body */}
                          <div className="bg-cyber-bg rounded-xl p-4 border border-cyber-border">
                            <p className="text-[11px] text-cyber-text-secondary uppercase tracking-widest mb-2 font-bold">Raw Request Body</p>
                            <pre className="font-mono text-xs text-cyber-text-primary whitespace-pre-wrap break-all">{attack.body || '{}'}</pre>
                          </div>

                          {/* Matched Rules */}
                          <div className="bg-cyber-bg rounded-xl p-4 border border-cyber-border">
                            <p className="text-[11px] text-cyber-text-secondary uppercase tracking-widest mb-2 font-bold">Detection Rules Matched</p>
                            {rules.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {rules.map((rule, ri) => (
                                  <span key={ri} className="px-2 py-1 rounded-md bg-cyber-accent-red/10 border border-cyber-accent-red/30 text-cyber-accent-red text-[11px] font-mono">
                                    {rule}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-cyber-text-secondary text-xs">No signature rules matched</span>
                            )}
                          </div>

                          {/* AI Insight */}
                          {attack.aiInsight && (
                            <div className="md:col-span-2 bg-cyber-bg rounded-xl p-4 border border-cyber-accent-blue/30">
                              <p className="text-[11px] text-cyber-accent-blue uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                                <span className="w-4 h-4">🤖</span> AI Analysis
                              </p>
                              <div className="space-y-2 text-sm text-cyber-text-primary leading-relaxed">
                                <p><strong className="text-cyber-accent-warning">What:</strong> {attack.aiInsight.explanation}</p>
                                <p><strong className="text-cyber-accent-warning">Intent:</strong> {attack.aiInsight.intention}</p>
                                <p><strong className="text-cyber-accent-warning">Danger:</strong> {attack.aiInsight.danger}</p>
                                <p><strong className="text-cyber-accent-warning">Fix:</strong> {attack.aiInsight.recommendation}</p>
                              </div>
                            </div>
                          )}

                          {/* Attacker Profile */}
                          {attacker && (
                            <div className="md:col-span-2 bg-cyber-bg rounded-xl p-4 border border-cyber-border">
                              <p className="text-[11px] text-cyber-text-secondary uppercase tracking-widest mb-2 font-bold">Attacker Profile</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                  <span className="text-[11px] text-cyber-text-secondary">IP</span>
                                  <p className="font-mono text-white">{attacker.ip}</p>
                                </div>
                                <div>
                                  <span className="text-[11px] text-cyber-text-secondary">Location</span>
                                  <p className="font-mono text-white">{attacker.city}, {attacker.country}</p>
                                </div>
                                <div>
                                  <span className="text-[11px] text-cyber-text-secondary">Organization</span>
                                  <p className="font-mono text-white">{attacker.organization || '—'}</p>
                                </div>
                                <div>
                                  <span className="text-[11px] text-cyber-text-secondary">Tags</span>
                                  <p className="font-mono text-cyber-accent-warning">{attacker.tags || '—'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
