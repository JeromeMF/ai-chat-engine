import type { ChatOptions, Mention } from './types';
export declare function create(opts?: ChatOptions): {
    loadStatus: () => Promise<void>;
    loadSessions: () => Promise<void>;
    available: () => boolean;
    status: () => import("./types").ChatStatus | null;
    home: () => string;
    sessionsFor: (key: string) => import("./types").SessionRow[];
    newOwnerKey: () => string;
    forget: (ownerKey: string, sessionId: string) => Promise<void>;
    isOpen: () => boolean;
    closeChat: () => void;
    /** `attach` opens it with those items already waiting to go with the first message. */
    openNew(ownerId: string, ownerKey: string, seed?: string, o?: {
        preface?: (ask: string) => string;
        attach?: Mention[];
    }): void;
    openSession(ownerId: string, ownerKey: string, sessionId: string): void;
    growFrom: (rect: import("./types").Origin | DOMRect | import("./types").Rect | null) => void;
    setRect: (rect: import("./types").Rect | null) => void;
    setZIndex: (z: number) => void;
    setActive: (v: boolean) => void;
    setPeeked: (v: boolean) => void;
    setHeader: (spec: import("./types").Header | null) => void;
    minimise: () => void;
    anchor: () => void;
    expand: () => void;
    dockState: () => import("./dock").DockState;
    /** Flips the open conversation between reading only and write mode, from its next message. A no-op unless `writeSwitch` was asked for and the helper allows writing. */
    setWrite: (on: boolean) => void;
    /** Whether the open conversation is in write mode. */
    canWrite: () => boolean;
    /** Puts an item on the open conversation's composer, to go with the next message, as if picked with `@`. Once per id. */
    attach: (m: Mention) => void;
    /** Takes an item back off the composer before it is sent. */
    detach: (id: string) => void;
    /** What is waiting to go with the next message. */
    attached: () => Mention[];
    running: () => boolean;
    /** The session the open conversation is on, or '' for a new one not yet sent or nothing open. */
    session: () => string;
    /** Takes the instance off the page for good: its markup, its listeners and any run in flight. closeChat() only hides it. */
    destroy(): void;
};
export type ChatInstance = ReturnType<typeof create>;
