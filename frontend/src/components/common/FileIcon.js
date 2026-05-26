import React from 'react';
import { FileText, FileSpreadsheet, File, Image } from 'lucide-react';

const EXT_MAP = {
  pdf: { Icon: FileText, color: '#ef4444' },
  doc: { Icon: FileText, color: '#2563eb' },
  docx: { Icon: FileText, color: '#2563eb' },
  xls: { Icon: FileSpreadsheet, color: '#10b981' },
  xlsx: { Icon: FileSpreadsheet, color: '#10b981' },
  ppt: { Icon: File, color: '#f97316' },
  pptx: { Icon: File, color: '#f97316' },
  png: { Icon: Image, color: '#8b5cf6' },
  jpg: { Icon: Image, color: '#8b5cf6' },
  jpeg: { Icon: Image, color: '#8b5cf6' },
};

function FileIcon({ fileName = '', size = 20 }) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const { Icon, color } = EXT_MAP[ext] || { Icon: File, color: '#6b7280' };
  return <Icon size={size} color={color} />;
}

export default FileIcon;
