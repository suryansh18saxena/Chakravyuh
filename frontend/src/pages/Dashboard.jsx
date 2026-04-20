import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE = `http://${window.location.hostname}:3001`;
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import MetricCards from '../components/MetricCards';
import GlobeMap from '../components/GlobeMap';
import AlertsFeed from '../components/AlertsFeed';
import Charts from '../components/Charts';
import AttackerProfiles from '../components/AttackerProfiles';
import AttacksTable from '../components/AttacksTable';
import { Download, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { globalStats, socket } = useGlobal();
  const [attacks, setAttacks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/attacks`).then(r => r.json()).then(data => setAttacks(Array.isArray(data) ? data : [])).catch(e => console.error(e));
    fetch(`${API_BASE}/api/sessions`).then(r => r.json()).then(data => setSessions(Array.isArray(data) ? data : [])).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNewAttack = (attackPayload) => {
        setAttacks(prev => [attackPayload, ...prev].slice(0, 50));
        fetch(`${API_BASE}/api/sessions`).then(r => r.json()).then(data => setSessions(Array.isArray(data) ? data : [])).catch(e => console.error(e));
    };
    socket.on('new_attack', handleNewAttack);
    return () => socket.off('new_attack', handleNewAttack);
  }, [socket]);

  const downloadReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/report`);
      const data = await res.json();
      generatePDF(data);
    } catch (e) {
      console.error('Report failed:', e);
      alert('Failed to generate report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date(data.generatedAt);
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // ===== HEADER =====
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(230, 57, 70);
    doc.rect(0, 43, pageWidth, 2, 'F');

    doc.setTextColor(230, 57, 70);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CHAKRAVYUH', 14, 22);

    doc.setTextColor(180, 180, 200);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Threat Intelligence Report', 14, 30);
    doc.text(`Generated: ${dateStr}`, 14, 37);

    doc.setTextColor(230, 57, 70);
    doc.setFontSize(8);
    doc.text('CLASSIFIED // INTERNAL USE ONLY', pageWidth - 14, 37, { align: 'right' });

    // ===== STATISTICS =====
    let y = 55;
    doc.setTextColor(230, 57, 70);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('THREAT LANDSCAPE OVERVIEW', 14, y);
    y += 8;

    doc.setFillColor(20, 20, 30);
    doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const statLabels = ['Total Attacks', 'Active Sessions', 'Countries', 'Critical Threats'];
    const statValues = [
      String(data.stats.totalPayloads),
      String(data.stats.activeSessions),
      String(data.stats.uniqueCountries),
      String(data.stats.criticalCount)
    ];
    const colW = (pageWidth - 28) / 4;
    statLabels.forEach((label, i) => {
      const cx = 14 + colW * i + colW / 2;
      doc.setTextColor(230, 57, 70);
      doc.setFontSize(16);
      doc.text(statValues[i], cx, y + 10, { align: 'center' });
      doc.setTextColor(140, 140, 170);
      doc.setFontSize(7);
      doc.text(label.toUpperCase(), cx, y + 17, { align: 'center' });
    });
    y += 30;

    // ===== AI EXECUTIVE SUMMARY =====
    doc.setTextColor(67, 97, 238);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI EXECUTIVE SUMMARY', 14, y);
    y += 6;

    doc.setTextColor(200, 200, 210);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(data.aiSummary, pageWidth - 28);
    doc.text(summaryLines, 14, y);
    y += summaryLines.length * 4.5 + 8;

    // ===== ATTACK TABLE =====
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setTextColor(230, 57, 70);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RECENT ATTACK PAYLOADS', 14, y);
    y += 4;

    const tableData = data.attacks.slice(0, 15).map(a => [
      new Date(a.timestamp).toLocaleTimeString(),
      `${a.method} ${a.endpoint}`,
      a.session?.attacker?.ip || 'N/A',
      a.session?.attacker?.country || 'N/A',
      a.severity?.toUpperCase() || 'N/A'
    ]);

    doc.autoTable({
      startY: y,
      head: [['Time', 'Request', 'Attacker IP', 'Country', 'Severity']],
      body: tableData,
      styles: { fontSize: 7, cellPadding: 2, textColor: [200, 200, 210], fillColor: [15, 15, 25] },
      headStyles: { fillColor: [230, 57, 70], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [20, 20, 35] },
      theme: 'grid',
      tableLineColor: [40, 40, 60],
      tableLineWidth: 0.2,
    });

    y = doc.lastAutoTable.finalY + 10;

    // ===== ATTACKER PROFILES =====
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setTextColor(45, 198, 83);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP THREAT ACTORS', 14, y);
    y += 4;

    const sessionData = data.sessions.slice(0, 8).map(s => [
      s.attacker?.ip || 'N/A',
      s.attacker?.country || 'N/A',
      String(s.payloads?.length || 0),
      s.attacker?.tags || 'N/A',
      s.attacker?.fingerprint?.substring(0, 16) || 'N/A'
    ]);

    doc.autoTable({
      startY: y,
      head: [['IP Address', 'Country', 'Payloads', 'Tags', 'Fingerprint']],
      body: sessionData,
      styles: { fontSize: 7, cellPadding: 2, textColor: [200, 200, 210], fillColor: [15, 15, 25] },
      headStyles: { fillColor: [45, 198, 83], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [20, 20, 35] },
      theme: 'grid',
      tableLineColor: [40, 40, 60],
      tableLineWidth: 0.2,
    });

    // ===== FOOTER =====
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFillColor(10, 10, 15);
      doc.rect(0, doc.internal.pageSize.getHeight() - 15, pageWidth, 15, 'F');
      doc.setTextColor(100, 100, 130);
      doc.setFontSize(7);
      doc.text('Chakravyuh Honeypot Defense System — Confidential', 14, doc.internal.pageSize.getHeight() - 6);
      doc.text(`Page ${i} of ${pages}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 6, { align: 'right' });
    }

    doc.save(`Chakravyuh_Threat_Report_${now.toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-8 animate-entry">
      
      <div className="flex items-center justify-between">
          <h1 className="page-title text-white">Command Center</h1>
          <div className="flex items-center gap-3">
              <button 
                className="btn btn-primary flex items-center gap-2 !py-2 !px-4"
                onClick={downloadReport}
                disabled={reportLoading}
              >
                {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {reportLoading ? 'Generating...' : 'Download Report'}
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/settings')}>System Config</button>
          </div>
      </div>

      <MetricCards stats={globalStats} />

      <div className="flex flex-col lg:flex-row gap-6 h-[480px]">
          <div className="w-full lg:w-[58%] h-full">
              <GlobeMap attacks={attacks} />
          </div>
          <div className="w-full lg:w-[42%] h-full">
              <AlertsFeed attacks={attacks} />
          </div>
      </div>

      <Charts attacks={attacks} />

      <div className="mt-8">
          <h2 className="section-header text-white uppercase tracking-widest text-[16px] mb-6">Active Threat Actors</h2>
          <AttackerProfiles sessions={sessions} />
      </div>

      <div className="mt-8 mb-16">
          <AttacksTable attacks={attacks} onReplay={(id) => navigate('/stories', { state: { sessionId: id } })} />
      </div>

    </div>
  );
}
