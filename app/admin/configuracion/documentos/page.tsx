"use client";
import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/panel/app-shell';
import { getBrochures, createBrochure, deleteBrochure } from '@/app/actions/brochures';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Upload, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DocumentosPage() {
  const [brochures, setBrochures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getBrochures();
    setBrochures(data);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.type !== 'application/pdf') {
      alert("Solo se permiten archivos PDF");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'documentos');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        let name = prompt("Nombre del documento:", file.name.replace('.pdf', '')) || file.name.replace('.pdf', '');
        await createBrochure({ nombre: name, file_url: data.url });
        await load();
      } else {
        alert("Error al subir archivo: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error en la subida");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(id: number) {
    if (confirm("¿Eliminar este documento?")) {
      await deleteBrochure(id);
      await load();
    }
  }

  return (
    <AppShell title="Biblioteca de Documentos">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-title text-slate-100 uppercase tracking-wider">Biblioteca de Documentos</h1>
            <p className="text-sm text-slate-400 font-tech">Sube archivos PDF para anexarlos a tus cotizaciones</p>
          </div>
          <div>
            <label className="bg-brand-cyan hover:bg-brand-blue text-slate-950 font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? "Subiendo..." : "Subir PDF"}
              <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Cargando documentos...</div>
          ) : brochures.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No hay documentos en la biblioteca.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Documento</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Fecha</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {brochures.map((b) => (
                  <tr key={b.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-brand-blue" />
                        <span className="font-semibold text-slate-200">{b.nombre}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(b.fecha_creacion).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <a href={b.file_url} target="_blank" rel="noreferrer" className="inline-flex p-2 text-slate-400 hover:text-brand-cyan transition-colors" title="Ver PDF">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleDelete(b.id)} className="inline-flex p-2 text-slate-400 hover:text-red-400 transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
