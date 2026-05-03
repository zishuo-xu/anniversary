import { useState, useRef, useCallback } from 'react';
import type { Config } from '../types';
import { triggerExport, importAll } from '../utils/storage';

interface Props {
  config: Config;
  onSave: (c: Config) => void;
  onReplayCelebration?: () => void;
  onLogout?: () => void;
}

export default function Settings({ config, onSave, onReplayCelebration, onLogout }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Config>(config);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setForm((p) => ({ ...p, photos: [...p.photos, result] }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removePhoto = (i: number) => {
    setForm((p) => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }));
  };

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importAll(text)) {
        alert('导入成功，页面即将刷新');
        window.location.reload();
      } else {
        alert('导入失败，文件格式不正确');
      }
      if (importRef.current) importRef.current.value = '';
    };
    reader.readAsText(file);
  }, []);

  const handleSave = () => {
    const start = new Date(form.startDateTime);
    const now = new Date();
    if (start > now) {
      alert('起始日期不能晚于当前时间');
      return;
    }
    onSave(form);
    setOpen(false);
  };

  const dateStr = form.startDateTime.slice(0, 10);
  const timeStr = form.startDateTime.slice(11, 16);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => { setOpen(true); setForm(config); }}
        className="fixed top-5 right-5 z-[50] p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
        aria-label="设置"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.67 15 1.65 1.65 0 0 0 3 13.5V13a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.67 1.65 1.65 0 0 0 10.5 3H11a2 2 0 0 1 4 0h.5a1.65 1.65 0 0 0 1.51 1 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9 1.65 1.65 0 0 0 21 10.5V11a2 2 0 0 1 0 4h-.5a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed right-0 top-0 h-full z-[70] w-full max-w-md bg-[#0a0a1e] border-l border-white/5 shadow-2xl overflow-y-auto"
            style={{ animation: 'slide-up 0.3s ease-out' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-light text-white/80 tracking-wider">设置纪念日</h2>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">纪念日标题</label>
                  <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm" placeholder="例如：我们的纪念日" />
                </div>

                <div>
                  <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">副标题</label>
                  <input type="text" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm" placeholder="例如：从遇见你的那一天开始" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">起始日期</label>
                    <input type="date" value={dateStr}
                      onChange={(e) => setForm((p) => ({ ...p, startDateTime: `${e.target.value}T${timeStr || '00:00'}:00` }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">起始时间</label>
                    <input type="time" value={timeStr}
                      onChange={(e) => setForm((p) => ({ ...p, startDateTime: `${dateStr || new Date().toISOString().slice(0, 10)}T${e.target.value}:00` }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">署名</label>
                  <input type="text" value={form.signature} onChange={(e) => setForm((p) => ({ ...p, signature: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm" placeholder="例如：Z & Y" />
                </div>

                <div>
                  <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">背景照片</label>
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/10 bg-white/3 text-white/30 hover:border-purple-400/40 hover:bg-purple-500/5 hover:text-white/50 transition-all text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                    上传照片（可多选）
                  </button>

                  {form.photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {form.photos.map((src, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-white/5">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white/60 hover:text-white text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <button onClick={handleSave}
                    className="w-full py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-sm tracking-wider transition-colors">
                    保存
                  </button>
                  <button onClick={() => setOpen(false)}
                    className="w-full py-3 rounded-xl border border-white/8 text-white/30 hover:bg-white/5 hover:text-white/50 text-sm tracking-wider transition-colors">
                    取消
                  </button>
                  {onReplayCelebration && (
                    <button onClick={() => { onReplayCelebration(); setOpen(false); }}
                      className="w-full py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-200/60 hover:text-amber-200/80 text-sm tracking-wider transition-colors">
                      重新播放庆祝烟花
                    </button>
                  )}

                  {/* Divider */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-white/15 text-[10px] tracking-wider uppercase">数据</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  <button onClick={triggerExport}
                    className="w-full py-3 rounded-xl border border-white/8 text-white/30 hover:bg-white/5 hover:text-white/50 text-sm tracking-wider transition-colors flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    导出备份
                  </button>

                  <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                  <button onClick={() => importRef.current?.click()}
                    className="w-full py-3 rounded-xl border border-white/8 text-white/30 hover:bg-white/5 hover:text-white/50 text-sm tracking-wider transition-colors flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    导入备份
                  </button>

                  {onLogout && (
                    <>
                      <div className="flex items-center gap-3 py-2">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-white/15 text-[10px] tracking-wider uppercase">账户</span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>
                      <button onClick={() => { onLogout(); setOpen(false); }}
                        className="w-full py-3 rounded-xl border border-white/8 text-white/30 hover:bg-white/5 hover:text-white/50 text-sm tracking-wider transition-colors">
                        退出登录
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
