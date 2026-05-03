import { useState } from 'react';
import { login } from '../api';

interface Props {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: Props) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0a0a2e 0%, #1a0a3e 40%, #2d1b4e 80%, #0d0d35 100%)',
      }}
    >
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <h1 className="font-serif text-white/80 text-2xl tracking-wider mb-2"
            style={{ textShadow: '0 0 20px rgba(255,220,120,0.3)' }}
          >
            纪念日
          </h1>
          <p className="text-white/30 text-xs tracking-[0.3em]">我们的故事，从这里开始</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-white/80 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] text-white/30 mb-2 tracking-wider uppercase">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="默认: anniversary"
              className="w-full px-4 py-3 rounded-xl border border-white/8 bg-white/5 text-white/80 placeholder-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/40 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-300/70 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-sm tracking-wider transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '进入'}
          </button>
        </form>
      </div>
    </div>
  );
}
