import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listPapers } from '../services/paperService.js';
import { listAttempts } from '../services/attemptService.js';
import { getPaper } from '../services/paperService.js';
import { scoreAttempt } from '../utils/scoring.js';
import { updateUserProfile } from '../services/authService.js';

function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    language: user?.language || 'English (In)',
    timezone: user?.timezone || 'IST (UTC+5:30)'
  });

  const papers = listPapers(user?.id);
  const attempts = listAttempts(user?.id);

  const handleSave = () => {
    const updatedUser = updateUserProfile(editForm);
    setUser(updatedUser);
    setIsEditing(false);
  };

  const stats = useMemo(() => {
    // ... same as before
    const solved = attempts.filter(a => a.status === 'submitted').length;
    const evaluated = attempts.map(a => {
      const p = getPaper(a.paperId);
      return p ? scoreAttempt(p, a) : null;
    }).filter(s => s && s.hasKey);

    const avgAccuracy = evaluated.length 
      ? Math.round(evaluated.reduce((sum, s) => sum + (s.totalScore / s.maxScore) * 100, 0) / evaluated.length)
      : 0;

    return {
      papersUploaded: papers.length,
      attemptsSolved: solved,
      accuracy: `${avgAccuracy}%`,
      streak: '1 Day'
    };
  }, [papers, attempts]);

  const activities = useMemo(() => {
    return attempts.slice(0, 5).map(a => {
      const p = getPaper(a.paperId);
      return {
        id: a.id,
        type: 'exam',
        name: p?.title || 'Unknown Paper',
        date: new Date(a.submittedAt || a.updatedAt).toLocaleDateString(),
        status: a.status === 'submitted' ? 'Completed' : 'In Progress'
      };
    });
  }, [attempts]);

  return (
    <div className='mx-auto max-w-5xl space-y-10 pb-20'>
      {/* Profile Header */}
      <section className='relative rounded-[40px] bg-[var(--surface)] p-10 border border-[var(--border)] shadow-2xl overflow-hidden'>
        <div className='absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--accent)] opacity-[0.05] blur-3xl'></div>
        <div className='absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[var(--accent-strong)] opacity-[0.03] blur-3xl'></div>
        
        <div className='flex flex-col md:flex-row items-center gap-10'>
          <div className='relative'>
            <div className='absolute inset-0 rounded-[35px] bg-[var(--accent)] opacity-20 blur-xl animate-pulse'></div>
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className='relative h-40 w-40 rounded-[35px] border-8 border-[var(--surface)] object-cover shadow-2xl' />
            ) : (
              <div className='relative flex h-40 w-40 items-center justify-center rounded-[35px] border-8 border-[var(--surface)] bg-gradient-to-br from-[var(--accent-strong)] to-[var(--accent)] text-6xl font-black text-white shadow-2xl'>
                {user.name?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          
          <div className='flex-1 text-center md:text-left'>
            <div className='inline-flex items-center gap-2 rounded-full border border-[var(--accent-soft)] bg-[var(--accent-soft)] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[var(--accent-strong)] shadow-sm'>
             ⚡ Verified Student
            </div>
            {isEditing ? (
              <input 
                className='mt-4 w-full bg-transparent text-6xl font-black tracking-tighter text-[var(--text)] outline-none border-b-2 border-[var(--accent)]'
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
              />
            ) : (
              <h1 className='mt-4 text-6xl font-black tracking-tighter text-[var(--text)]'>
                {user.name}
              </h1>
            )}
            <p className='mt-3 text-xl font-medium text-[var(--muted)]'>{user.email}</p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
        {[
          { label: 'Papers', value: stats.papersUploaded, color: 'bg-purple-500', icon: '📚' },
          { label: 'Solved', value: stats.attemptsSolved, color: 'bg-blue-500', icon: '📝' },
          { label: 'Accuracy', value: stats.accuracy, color: 'bg-green-500', icon: '🎯' },
          { label: 'Streak', value: stats.streak, color: 'bg-orange-500', icon: '🔥' },
        ].map((stat, i) => (
          <div key={i} className='metric !p-6'>
            <div className={'mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-xl ' + stat.color + '/10'}>{stat.icon}</div>
            <p className='text-sm font-bold text-[var(--muted)] uppercase tracking-wider'>{stat.label}</p>
            <p className='mt-1 text-3xl font-black text-[var(--text)] tracking-tight'>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Personal Info & Activity Grid */}
      <div className='grid gap-8 md:grid-cols-[1.2fr_1.8fr]'>
        <section className='panel p-10'>
          <h2 className='text-2xl font-black tracking-tight text-[var(--text)] mb-8'>Account Details</h2>
          <div className='space-y-6'>
            <div className='flex items-center justify-between py-2 border-b border-[var(--border)]'>
              <span className='text-sm font-medium text-[var(--muted)]'>Member Since</span>
              <span className='text-sm font-black text-[var(--text)]'>{user.memberSince || 'April 2024'}</span>
            </div>
            <div className='flex items-center justify-between py-2 border-b border-[var(--border)]'>
              <span className='text-sm font-medium text-[var(--muted)]'>Language</span>
              {isEditing ? (
                <input 
                  className='bg-[var(--surface-muted)] px-3 py-1 rounded-lg text-sm font-black text-[var(--accent-strong)] text-right outline-none ring-2 ring-[var(--accent)]/20 focus:ring-[var(--accent)] transition-all' 
                  value={editForm.language} 
                  onChange={e => setEditForm({...editForm, language: e.target.value})} 
                />
              ) : (
                <span className='text-sm font-black text-[var(--text)]'>{user.language || 'English (In)'}</span>
              )}
            </div>
            <div className='flex items-center justify-between py-2'>
              <span className='text-sm font-medium text-[var(--muted)]'>Timezone</span>
              {isEditing ? (
                <input 
                  className='bg-[var(--surface-muted)] px-3 py-1 rounded-lg text-sm font-black text-[var(--accent-strong)] text-right outline-none ring-2 ring-[var(--accent)]/20 focus:ring-[var(--accent)] transition-all' 
                  value={editForm.timezone} 
                  onChange={e => setEditForm({...editForm, timezone: e.target.value})} 
                />
              ) : (
                <span className='text-sm font-black text-[var(--text)]'>{user.timezone || 'IST (UTC+5:30)'}</span>
              )}
            </div>
          </div>
          <div className='mt-8 flex gap-3'>
            {isEditing ? (
              <>
                <button onClick={handleSave} className='btn btn-primary !h-10 px-6 text-xs font-black uppercase tracking-widest'>Save Changes</button>
                <button onClick={() => setIsEditing(false)} className='btn btn-secondary !h-10 px-6 text-xs font-black uppercase tracking-widest'>Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className='btn btn-secondary !h-10 px-6 text-xs font-black uppercase tracking-widest'>Edit Profile</button>
                <button onClick={() => setIsEditing(true)} className='btn btn-secondary !h-10 px-6 text-xs font-black uppercase tracking-widest'>Settings</button>
              </>
            )}
          </div>
        </section>


        <section className='panel p-10'>
          <div className='flex items-center justify-between mb-8'>
            <h2 className='text-2xl font-black tracking-tight text-[var(--text)]'>Real Activity</h2>
            <button className='text-sm font-bold text-[var(--accent)] hover:underline'>History</button>
          </div>
          <div className='space-y-4'>
            {activities.length === 0 ? (
              <p className='text-center py-10 text-[var(--muted)] font-bold italic'>No activity recorded yet.</p>
            ) : activities.map((act) => (
              <div key={act.id} className='group flex items-center justify-between rounded-2xl bg-[var(--surface-muted)] p-5 transition-all hover:bg-[var(--accent-soft)]'>
                <div className='flex items-center gap-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface)] text-xl shadow-sm'>
                    📖
                  </div>
                  <div>
                    <p className='font-black text-[var(--text)]'>{act.name}</p>
                    <p className='text-xs text-[var(--muted)]'>{act.date}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-black text-[var(--accent-strong)]'>{act.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
