import { useEffect, useState } from "react";
import type { Inspecao, NaoConformidade, PerfilUsuario } from "@/types/sst";
import {
  inspecoes as inspecoesSeed,
  ncs as ncsSeed,
} from "@/mocks/data";

type Listener = () => void;

interface State {
  inspecoes: Inspecao[];
  ncs: NaoConformidade[];
  offline: boolean;
  pendingSync: number;
  perfil: PerfilUsuario;
  usuarioLogado: string;
}

const KEY = "sst-store-v1";

function load(): State {
  if (typeof window === "undefined") {
    return base();
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...base(), ...JSON.parse(raw) };
  } catch {}
  return base();
}

function base(): State {
  return {
    inspecoes: inspecoesSeed,
    ncs: ncsSeed,
    offline: false,
    pendingSync: 1,
    perfil: "inspetor",
    usuarioLogado: "u1",
  };
}

let state: State = base();
let initialized = false;
const listeners = new Set<Listener>();

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    state = load();
    initialized = true;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export const store = {
  get: () => {
    ensureInit();
    return state;
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  setOffline(v: boolean) {
    state = { ...state, offline: v };
    emit();
  },
  setPerfil(p: PerfilUsuario) {
    state = { ...state, perfil: p };
    emit();
  },
  setUsuario(id: string) {
    state = { ...state, usuarioLogado: id };
    emit();
  },
  sync() {
    state = { ...state, pendingSync: 0 };
    emit();
  },
  upsertInspecao(ins: Inspecao) {
    const exists = state.inspecoes.find((i) => i.id === ins.id);
    state = {
      ...state,
      inspecoes: exists
        ? state.inspecoes.map((i) => (i.id === ins.id ? ins : i))
        : [ins, ...state.inspecoes],
      pendingSync: state.offline ? state.pendingSync + 1 : state.pendingSync,
    };
    emit();
  },
  upsertNC(nc: NaoConformidade) {
    const exists = state.ncs.find((n) => n.id === nc.id);
    state = {
      ...state,
      ncs: exists
        ? state.ncs.map((n) => (n.id === nc.id ? nc : n))
        : [nc, ...state.ncs],
      pendingSync: state.offline ? state.pendingSync + 1 : state.pendingSync,
    };
    emit();
  },
  reset() {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
    state = base();
    emit();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => force((x) => x + 1));
    return () => {
      unsub();
    };
  }, []);
  return selector(store.get());
}
