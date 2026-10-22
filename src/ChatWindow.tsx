import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { ThinkingOrb } from 'thinking-orbs';
import type { OrbState } from 'thinking-orbs';
import { Alert, Button, EditableText, LinkButton, Modal, Pill, Spinner, Switch, Textarea, Window } from '@tiagopedras/tenon';
import type { ChatController, ChatView } from './controller';
import type { Mention } from './types';
import { Transcript } from './Transcript';
import { useChat, useNow } from './useChat';
import './chat.css';

/* The line above the composer. Its words are the progress: what the run is
   doing now, rewritten in place as it moves, and a clock beside it. Sits next
   to the input so it reads as "working on your last message", not as chrome
   up top. */
/* Which orb each moment of a run gets, when the host asked for orbs. Keyed by
   the run's own status; `decision` is the wait on a permission answer, and
   anything not listed, a tool call included, is drawn as thinking. */
const ORBS: Record<string, { state: OrbState; dots: number; dotSize: number }> = {
  starting: { state: 'breathing', dots: 0.5, dotSize: 1.1 },
  thinking: { state: 'solving', dots: 0.65, dotSize: 1.1 },
  writing: { state: 'composing', dots: 0.45, dotSize: 1.1 },
  decision: { state: 'listening', dots: 0.5, dotSize: 1.1 },
};

function Status({ view }: { view: ChatView }) {
  const running = view.status.kind === 'running';
  const now = useNow(running);
  const s = view.status;
  /* The orb is decoration: the words beside it are what a screen reader hears. */
  const orb = view.thinkingOrbs
    ? ORBS[s.kind === 'permission' ? 'decision' : s.kind === 'running' ? s.phase : ''] || ORBS.thinking
    : null;
  const spinner = orb ? (
    <ThinkingOrb size={20} state={orb.state} dots={orb.dots} dotSize={orb.dotSize} className="aic-star aic-orb" aria-hidden="true" />
  ) : (
    <Spinner
      size="sm"
      variant={view.thinkingGlyphs ? 'glyph' : 'ring'}
      className={view.thinkingGlyphs ? 'aic-star aic-glyph' : 'aic-star'}
      label="Working"
    />
  );
  if (s.kind === 'permission') {
    return <div className="aic-status aic-live" aria-live="polite">{spinner}<span className="aic-doing">Waiting on your decision</span></div>;
  }
  if (s.kind === 'running') {
    return (
      <div className="aic-status aic-live" aria-live="polite">
        {spinner}
        <span className="aic-doing">{s.doing}</span>
        <em className="aic-clock">{Math.max(0, Math.round((now - s.started) / 1000))}s</em>
      </div>
    );
  }
  return <div className="aic-status" aria-live="polite">{s.text}</div>;
}

/* The banner that takes an answer. Shown between the head and the transcript
   whenever the run is waiting on a tool decision: not a status line, which
   reports, but a question. */
function Permission({ view, controller }: { view: ChatView; controller: ChatController }) {
  const p = view.permission;
  if (!p) return null;
  return (
    <Alert
      tone="warning"
      className="aic-permission"
      title={p.title}
      actions={
        <>
          <Button variant="primary" size="sm" onClick={() => controller.answerPermission('allow')}>Allow</Button>
          {p.canAlwaysAllow && (
            <Button variant="ghost" size="sm" title="Allow this for the rest of the session, without asking again" onClick={() => controller.answerPermission('allow_always')}>
              Always allow
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => controller.answerPermission('deny')}>Deny</Button>
        </>
      }
    >
      {p.description || undefined}
    </Alert>
  );
}

/* Where an `@` mention starts, and what has been typed after it: an `@` at
   the start or after a space, with no new line between it and the caret.
   Spaces are allowed, so "@fix login" can narrow to a title with both. */
const MENTION_AT = /(^|\s)@([^\n@]{0,60})$/;
const PICKER_MAX = 8;

function findTrigger(text: string, caret: number): { at: number; query: string } | null {
  const m = MENTION_AT.exec(text.slice(0, caret));
  return m ? { at: m.index + m[1].length, query: m[2] } : null;
}

/* The `@` picker, over the composer. It never takes focus: the caret stays in
   the box, the arrows move the highlight and Enter or Tab picks, so typing on
   carries on narrowing it. */
function Picker({ id, items, active, onPick, onHover }: {
  id: string;
  items: Mention[];
  active: number;
  onPick: (m: Mention) => void;
  onHover: (i: number) => void;
}) {
  return (
    <ul className="aic-picker" role="listbox" id={id} aria-label="Add to context">
      {items.map((m, i) => (
        <li
          key={m.id}
          id={`${id}-${i}`}
          role="option"
          aria-selected={i === active}
          className="aic-pick"
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => onHover(i)}
          onClick={() => onPick(m)}
        >
          {m.title}
        </li>
      ))}
    </ul>
  );
}

function Composer({ view, controller, draft, setDraft, input }: {
  view: ChatView;
  controller: ChatController;
  draft: string;
  setDraft: (v: string) => void;
  input: React.RefObject<HTMLTextAreaElement>;
}) {
  const pickerId = useId();
  const [trigger, setTrigger] = useState<{ at: number; query: string } | null>(null);
  const [active, setActive] = useState(0);
  /* The `@` Escape was pressed on, as everything up to and including it. The
     picker stays shut for that `@` until the caret leaves it or the text
     before it changes, so dismissing it once is enough. */
  const [dismissed, setDismissed] = useState('');
  /* A picker left open belongs to the conversation it was opened in. */
  useEffect(() => { setTrigger(null); setDismissed(''); }, [view.openId]);
  /* What is already attached is not offered again. */
  const items = view.mentionable && trigger && !view.busy
    ? controller.findMentions(trigger.query).filter((m) => !view.attached.some((a) => a.id === m.id)).slice(0, PICKER_MAX)
    : [];
  const open = items.length > 0;

  const scan = (text: string, caret: number) => {
    if (!view.mentionable) return;
    const next = findTrigger(text, caret);
    const head = next ? text.slice(0, next.at + 1) : '';
    if (head !== dismissed) setDismissed('');
    if (next && head === dismissed) { setTrigger(null); return; }
    if (next?.query !== trigger?.query || next?.at !== trigger?.at) setActive(0);
    setTrigger(next);
  };

  /* The `@` and what followed it come out of the box, and the item goes on
     the composer as a chip instead. */
  const pick = (m: Mention) => {
    if (!trigger) return;
    const el = input.current;
    const caret = el ? el.selectionStart : draft.length;
    const next = draft.slice(0, trigger.at) + draft.slice(caret);
    setDraft(next);
    setTrigger(null);
    controller.attach(m);
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(trigger.at, trigger.at); });
  };

  /* Escape belongs to the picker while it is open, not to the window around
     it. Caught on the way down, before Tenon's Modal hears it on the
     document; a Window skips a key from inside [data-tenon-editing]. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      e.preventDefault();
      const el = input.current;
      if (trigger && el) setDismissed(el.value.slice(0, trigger.at + 1));
      setTrigger(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, trigger]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (controller.send(draft)) { setDraft(''); setTrigger(null); }
    else input.current?.focus();
  };
  /* Enter sends, shift-Enter is a new line. Not while an input method is
     composing, where Enter confirms the word. With the picker open, Enter and
     Tab pick and the arrows move through it. */
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setActive((a) => (a + step + items.length) % items.length);
        return;
      }
      if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        pick(items[Math.min(active, items.length - 1)]);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };
  const combobox = view.mentionable ? {
    role: 'combobox',
    'aria-autocomplete': 'list' as const,
    'aria-expanded': open,
    'aria-controls': open ? pickerId : undefined,
    'aria-activedescendant': open ? `${pickerId}-${Math.min(active, items.length - 1)}` : undefined,
    'data-tenon-editing': open ? '' : undefined,
  } : {};
  return (
    <form className="aic-foot" autoComplete="off" onSubmit={submit}>
      {open && <Picker id={pickerId} items={items} active={Math.min(active, items.length - 1)} onPick={pick} onHover={setActive} />}
      {view.attached.length > 0 && (
        <div className="aic-attached">
          {view.attached.map((m) => (
            <Pill key={m.id} tone="accent" className="aic-chip" title={m.title}>
              <span className="aic-chiptext">{m.title}</span>
              <button type="button" className="aic-unattach" aria-label={`Remove ${m.title}`} onClick={() => { controller.detach(m.id); input.current?.focus(); }}>×</button>
            </Pill>
          ))}
        </div>
      )}
      <Textarea
        ref={input}
        autoGrow
        className="aic-input"
        placeholder={view.placeholder}
        spellCheck={false}
        value={draft}
        disabled={view.busy}
        onChange={(e) => { setDraft(e.target.value); scan(e.target.value, e.target.selectionStart); }}
        onSelect={(e) => scan(e.currentTarget.value, e.currentTarget.selectionStart)}
        onBlur={() => setTrigger(null)}
        onKeyDown={onKeyDown}
        autoFocus
        {...combobox}
      />
      {/* Send and Stop share one slot, so the primary action is never
          competing with another for the same glance. */}
      {view.busy
        ? <Button type="button" variant="secondary" className="aic-stop" onClick={controller.stop}>Stop</Button>
        : <Button type="submit" variant="primary" className="aic-send">Send</Button>}
    </form>
  );
}

/* The chat window: a Tenon Modal, or a Tenon Window when the host places it.
   What is drawn here is arrangement only. The dialog, buttons, composer, pills
   and permission banner are Tenon's, so a change to how any of them looks is
   made once, there. */
export function ChatWindow({ controller }: { controller: ChatController }) {
  const view = useChat(controller);
  const [draft, setDraft] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);

  /* A conversation opens with an empty box, or with whatever seed the host
     gave it, and never with a draft left over from the last one. */
  useEffect(() => {
    if (view.openId) setDraft(controller.takeSeed());
  }, [view.openId, controller]);

  const title = view.renamable
    ? <EditableText value={view.title} onCommit={controller.rename} />
    : view.title;
  const subtitle = (view.ownerLabel || view.subtitle) ? (
    <>
      {view.ownerLabel && <span className="aic-for">{view.ownerLabel}</span>}
      {view.subtitle && <span className="aic-sub">{view.subtitle}</span>}
    </>
  ) : undefined;
  /* Takes effect from the next message: the mode is read on every send. */
  const writeSwitch = view.writeSwitch ? (
    <label className="aic-write" title="Lets Claude create and edit files inside its working folder, from your next message">
      <Switch checked={view.canWrite} onChange={controller.setWrite} aria-label="Can write" />
      <span>Can write</span>
    </label>
  ) : null;
  const desktop = view.desktopHref ? (
    <LinkButton
      variant="ghost"
      size="sm"
      className="aic-desktop"
      href={view.desktopHref}
      target="_blank"
      rel="noopener"
      title="Imports this session into Claude Desktop and carries it on there"
    >
      Open in Claude
    </LinkButton>
  ) : null;
  const headEnd = (writeSwitch || desktop) ? <>{writeSwitch}{desktop}</> : undefined;

  const body = (
    <>
      <Permission view={view} controller={controller} />
      <Transcript view={view} controller={controller} onEdit={(text) => { setDraft(text); input.current?.focus(); }} />
    </>
  );
  const footer = (
    <>
      <Status view={view} />
      <Composer view={view} controller={controller} draft={draft} setDraft={setDraft} input={input} />
    </>
  );

  const p = view.presentation;

  /* Docked: a bar or a panel on the bottom edge, placed by the dock row
     rather than by the host or a drag. The same Window, so the head, the
     close button and the conversation inside are the ones it always had. */
  if (view.dockable && p.dock !== 'none') {
    const minimised = p.dock === 'minimised';
    const ignoreHead = (e: React.PointerEvent) => {
      controller.pressed();
      /* Window starts a drag from any press on its head; a docked chat does
         not move, so a press there stops before it gets that far. */
      const t = e.target as HTMLElement;
      if (t.closest('.tenon-window__head') && !t.closest('button,a,input,textarea,[contenteditable="true"]')) e.stopPropagation();
    };
    const runLabel = view.status.kind === 'permission' ? 'Needs you'
      : view.status.kind === 'running' ? view.status.doing
      : (view.runState || '');
    const dockEnd = minimised
      ? <span className="aic-dockstate">{runLabel}</span>
      : (
        <>
          {headEnd}
          <Button variant="ghost" size="sm" iconOnly className="aic-minimise" aria-label="Minimise" title="Minimise" onClick={controller.minimise}>–</Button>
          <Button variant="ghost" size="sm" iconOnly className="aic-expand" aria-label="Expand" title="Expand" onClick={controller.expand}>⤢</Button>
        </>
      );
    return (
      <Window
        open={view.open}
        onClose={controller.closeChat}
        closeButton={!view.pinned}
        title={minimised ? view.title : title}
        subtitle={minimised ? undefined : subtitle}
        headEnd={dockEnd}
        footer={minimised ? undefined : footer}
        bare
        className={'aic-box aic-docked ' + (minimised ? 'aic-minimised' : 'aic-anchored') + (view.pinned ? ' aic-pinned' : '')}
        data-state={view.runState || undefined}
        rect={p.dockRect}
        zIndex={p.zIndex}
        active={p.active && !minimised}
        onPointerDownCapture={ignoreHead}
        onClick={minimised ? (e) => {
          if (!(e.target as HTMLElement).closest('button,a')) controller.anchor();
        } : undefined}
      >
        {minimised ? null : body}
      </Window>
    );
  }

  /* The way down to the dock, for a host that asked for it. */
  const openEnd = view.dockable ? (
    <>
      {headEnd}
      <Button variant="ghost" size="sm" iconOnly className="aic-minimise" aria-label="Minimise" title="Minimise" onClick={controller.minimise}>–</Button>
    </>
  ) : headEnd;

  if (view.windowed) {
    return (
      <Window
        open={view.open}
        onClose={controller.closeChat}
        title={title}
        subtitle={subtitle}
        headEnd={openEnd}
        footer={footer}
        bare
        className="aic-box"
        data-state={view.runState || undefined}
        rect={p.rect}
        growFrom={p.growFrom}
        zIndex={p.zIndex}
        active={p.active}
        peeked={p.peeked}
        onRectLive={controller.rectLive}
        onRectChange={controller.rectChange}
        onFocus={controller.pressed}
      >
        {body}
      </Window>
    );
  }
  return (
    <Modal
      open={view.open}
      onClose={controller.closeChat}
      title={title}
      subtitle={subtitle}
      headEnd={openEnd}
      footer={footer}
      size="lg"
      bare
      className="aic-box aic-modal"
    >
      {body}
    </Modal>
  );
}
