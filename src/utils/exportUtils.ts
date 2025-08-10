import { Session, BehaviorButton } from '../types';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToCSV = (session: Session, buttons: BehaviorButton[]) => {
  const headers = ['Behavior', 'Start Time', 'End Time', 'Duration (seconds)'];
  const rows = session.segments.map(segment => {
    const button = buttons.find(b => b.id === segment.buttonId);
    return [
      button?.label || 'Unknown',
      format(segment.startTime, 'yyyy-MM-dd HH:mm:ss'),
      segment.endTime ? format(segment.endTime, 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      Math.floor((segment.duration || 0) / 1000).toString()
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${session.id}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (session: Session, buttons: BehaviorButton[]) => {
  const exportData = {
    sessionId: session.id,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.endTime 
      ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      : null,
    segments: session.segments.map(segment => {
      const button = buttons.find(b => b.id === segment.buttonId);
      return {
        behavior: button?.label || 'Unknown',
        buttonId: segment.buttonId,
        startTime: segment.startTime,
        endTime: segment.endTime,
        duration: segment.duration,
        audioStartTime: segment.audioStartTime,
        audioEndTime: segment.audioEndTime
      };
    }),
    transcription: session.transcription,
    summary: session.summary
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${session.id}-${format(new Date(), 'yyyy-MM-dd')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const generatePDFReport = async (
  session: Session, 
  buttons: BehaviorButton[],
  elementId: string
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`behavior-report-${session.id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};