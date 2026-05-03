import { useState, useRef, useCallback } from 'react';
import type { TimelineEvent } from '../types';

interface Props {
  event: TimelineEvent | null;
  onSave: (e: TimelineEvent) => void;
  onClose: () => void;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TimelineForm({ event, onSave, onClose }: Props) {
  const [date, setDate] = useState(event?.date || new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState(event?.title || '');
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [photos, setPhotos] = useState<string[]>(event?.photos || []);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 3 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setPhotos((p) => (p.length < 6 ? [...p, result] : p));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('请输入标题');
      return;
    }
    onSave({
      id: event?.id || generateId(),
      date,
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
      photos,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{
          background: 'rgba(10, 10, 30, 0.95)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 60px rgba(0,0,0,0.5)',
          animation: 'slide-up 0.3s ease-out',
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white/70 text-base font-light tracking-wider">{event ? '编辑回忆' : '添加回忆'}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">日期</label>
              <input type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">标题</label>
              <input type="text" value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：第一次一起旅行"
                className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">地点</label>
              <input type="text" value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例如：大理"
                className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">描述</label>
              <textarea value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="写下当时的心情和故事..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/80 placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">照片</label>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={handleFile}
              />
              <button onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/10 bg-white/3 text-white/30 hover:border-purple-400/40 hover:bg-purple-500/5 hover:text-white/50 transition-all text-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                上传照片（最多6张）
              </button>

              {photos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {photos.map((src, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-white/5">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white/60 hover:text-white text-xs"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 space-y-3">
              <button onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-sm tracking-wider transition-colors"
              >
                保存
              </button>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl border border-white/8 text-white/30 hover:bg-white/5 hover:text-white/50 text-sm tracking-wider transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
