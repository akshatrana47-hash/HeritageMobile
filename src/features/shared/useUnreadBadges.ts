import { useEffect, useState } from 'react';
import { useRepository } from '../../app/ServicesProvider';
import { useSessionStore } from '../../state/sessionStore';

/** Derived unread counts for tab badges, subscribed directly to the repository. */
export function useUnreadBadges() {
  const repo = useRepository();
  const userId = useSessionStore(s => s.user?.id);
  const compute = () => {
    if (!userId || !repo.isHydrated) return { mail: false, notifications: false };
    const db = repo.data;
    return {
      mail: db.mail.some(m => m.ownerId === userId && m.folder === 'inbox' && !m.read),
      notifications: db.notifications.some(n => n.userId === userId && !n.read),
    };
  };
  const [state, setState] = useState(compute);
  useEffect(() => {
    setState(compute());
    return repo.subscribe(() => setState(compute()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, userId]);
  return state;
}
