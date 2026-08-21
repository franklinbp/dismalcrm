import { User } from "../types/crm";

export type SessionUpdate = {
  token: string | null;
  user: User | null;
};

type SessionListener = (session: SessionUpdate) => void;

const listeners = new Set<SessionListener>();

export function subscribeToSession(listener: SessionListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishSession(session: SessionUpdate) {
  listeners.forEach(listener => listener(session));
}
