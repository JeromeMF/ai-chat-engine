import { useEffect as e, useId as t, useLayoutEffect as n, useRef as r, useState as i, useSyncExternalStore as a } from "react";
import { ThinkingOrb as o } from "thinking-orbs";
import { Alert as s, Button as c, Disclosure as l, EditableText as u, LinkButton as d, Markdown as f, Modal as p, Pill as m, Spinner as h, Switch as g, Textarea as _, Window as v } from "@tiagopedras/tenon";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
import { createRoot as S } from "react-dom/client";
//#region src/Transcript.tsx
function C({ text: t, className: n }) {
	let [a, o] = i("idle"), s = r();
	e(() => () => clearTimeout(s.current), []);
	let l = (e) => {
		o(e), clearTimeout(s.current), s.current = setTimeout(() => o("idle"), e === "done" ? 1500 : 4e3);
	};
	return /* @__PURE__ */ b(c, {
		size: "sm",
		variant: "secondary",
		className: n,
		"data-state": a === "idle" ? void 0 : a,
		onClick: () => {
			(navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => l("done"), () => l("failed"));
		},
		children: a === "done" ? "Copied" : a === "failed" ? "Copy failed" : "Copy"
	});
}
function w({ tools: e }) {
	if (!e.length) return null;
	let t = [];
	e.forEach((e) => {
		let n = e.split(" ")[0];
		t.includes(n) || t.push(n);
	});
	let n = `${e.length} ${e.length === 1 ? "step" : "steps"} · ${t.slice(0, 4).join(", ")}${t.length > 4 ? "…" : ""}`;
	return /* @__PURE__ */ b(l, {
		className: "aic-trace",
		summary: n,
		children: /* @__PURE__ */ b("ol", {
			className: "aic-timeline",
			children: e.map((e, t) => /* @__PURE__ */ x("li", { children: [/* @__PURE__ */ b("span", { className: "aic-tick" }), e] }, t))
		})
	});
}
function T({ flow: e }) {
	let t = [], n = [], r = (e) => {
		n.length && (t.push(/* @__PURE__ */ b("div", {
			className: "aic-toolpills",
			children: n.map((e, t) => /* @__PURE__ */ b(m, {
				dot: !0,
				children: e
			}, t))
		}, `p${e}`)), n = []);
	};
	return e.forEach((e, i) => {
		e.kind === "tool" ? n.push(e.label) : (r(i), t.push(/* @__PURE__ */ b(f, {
			className: "aic-reply",
			children: e.text
		}, `t${i}`)));
	}), r(e.length), e.length ? /* @__PURE__ */ b("div", {
		className: "aic-flow",
		children: t
	}) : null;
}
function E({ turn: e, index: t, showActs: n, inlineTools: r, onRetry: i, onEdit: a }) {
	return /* @__PURE__ */ x("div", {
		className: "aic-turn",
		children: [
			/* @__PURE__ */ b("div", {
				className: "aic-mine",
				children: /* @__PURE__ */ x("div", {
					className: "aic-minewrap",
					children: [
						/* @__PURE__ */ b("div", {
							className: "aic-bubble",
							children: /* @__PURE__ */ b(f, {
								inline: !0,
								children: e.ask
							})
						}),
						!!e.mentions?.length && /* @__PURE__ */ b("div", {
							className: "aic-mentions",
							children: e.mentions.map((e, t) => /* @__PURE__ */ x(m, {
								className: "aic-mention",
								title: e.link || void 0,
								children: [e.title, " added to context"]
							}, t))
						}),
						n && /* @__PURE__ */ x("div", {
							className: "aic-mineacts",
							children: [
								/* @__PURE__ */ b(C, { text: e.ask }),
								/* @__PURE__ */ b(c, {
									size: "sm",
									variant: "secondary",
									onClick: () => i(t),
									children: "Retry"
								}),
								/* @__PURE__ */ b(c, {
									size: "sm",
									variant: "secondary",
									onClick: () => a(t),
									children: "Edit"
								})
							]
						})
					]
				})
			}),
			r ? /* @__PURE__ */ b(T, { flow: e.flow }) : /* @__PURE__ */ b(w, { tools: e.tools }),
			e.reply && (r ? /* @__PURE__ */ b("div", {
				className: "aic-acts",
				children: /* @__PURE__ */ b(C, { text: e.reply })
			}) : /* @__PURE__ */ x("div", {
				className: "aic-reply",
				children: [/* @__PURE__ */ b(f, { children: e.reply }), /* @__PURE__ */ b("div", {
					className: "aic-acts",
					children: /* @__PURE__ */ b(C, { text: e.reply })
				})]
			})),
			e.error && /* @__PURE__ */ b(s, {
				tone: "error",
				className: "aic-err",
				title: e.error,
				children: e.detail || void 0
			})
		]
	});
}
var ee = (e) => e.scrollHeight - e.scrollTop - e.clientHeight < 80;
function te({ view: e, controller: t, onEdit: a }) {
	let o = r(null), l = r(!0), [u, d] = i(!1), f = r(!1), p = () => {
		let e = o.current;
		e && (l.current = ee(e), d(!l.current && e.scrollHeight > e.clientHeight));
	};
	n(() => {
		let t = o.current;
		t && ((e.busy || f.current) && l.current && (t.scrollTop = t.scrollHeight), f.current = e.busy, p());
	});
	let m;
	return m = e.loadErr && !e.turns.length ? /* @__PURE__ */ b(s, {
		tone: "error",
		children: e.loadErr
	}) : e.toobig ? /* @__PURE__ */ b("p", {
		className: "aic-none",
		children: "That transcript is too large to replay here. Claude Desktop will open it in full."
	}) : e.turns.length ? e.turns.map((n, r) => /* @__PURE__ */ b(E, {
		turn: n,
		index: r,
		showActs: r === e.turns.length - 1 && !e.busy,
		inlineTools: e.inlineTools,
		onRetry: t.retry,
		onEdit: (e) => a(t.editText(e))
	}, r)) : e.loading ? /* @__PURE__ */ b("p", {
		className: "aic-none",
		children: "…"
	}) : /* @__PURE__ */ x("p", {
		className: "aic-none",
		children: [
			"Nothing said yet. What it can see is everything under ",
			/* @__PURE__ */ b("code", { children: e.home }),
			"."
		]
	}), /* @__PURE__ */ x("div", {
		className: "aic-bodywrap",
		children: [/* @__PURE__ */ b("div", {
			className: "aic-body",
			ref: o,
			onScroll: p,
			children: m
		}), u && /* @__PURE__ */ b(c, {
			size: "sm",
			variant: "secondary",
			className: "aic-scrollpill",
			onClick: () => {
				let e = o.current;
				e && (e.scrollTop = e.scrollHeight, p());
			},
			children: "New messages ↓"
		})]
	});
}
//#endregion
//#region src/useChat.ts
function D(e) {
	return a(e.subscribe, e.getSnapshot, e.getSnapshot);
}
function ne(t) {
	let [n, r] = i(() => Date.now());
	return e(() => {
		if (!t) return;
		r(Date.now());
		let e = setInterval(() => r(Date.now()), 1e3);
		return () => clearInterval(e);
	}, [t]), n;
}
//#endregion
//#region src/ChatWindow.tsx
var O = {
	starting: {
		state: "breathing",
		dots: .5,
		dotSize: 1.1
	},
	thinking: {
		state: "solving",
		dots: .65,
		dotSize: 1.1
	},
	writing: {
		state: "composing",
		dots: .45,
		dotSize: 1.1
	},
	decision: {
		state: "listening",
		dots: .5,
		dotSize: 1.1
	}
};
function re({ view: e }) {
	let t = ne(e.status.kind === "running"), n = e.status, r = e.thinkingOrbs ? O[n.kind === "permission" ? "decision" : n.kind === "running" ? n.phase : ""] || O.thinking : null, i = r ? /* @__PURE__ */ b(o, {
		size: 20,
		state: r.state,
		dots: r.dots,
		dotSize: r.dotSize,
		className: "aic-star aic-orb",
		"aria-hidden": "true"
	}) : /* @__PURE__ */ b(h, {
		size: "sm",
		variant: e.thinkingGlyphs ? "glyph" : "ring",
		className: e.thinkingGlyphs ? "aic-star aic-glyph" : "aic-star",
		label: "Working"
	});
	return n.kind === "permission" ? /* @__PURE__ */ x("div", {
		className: "aic-status aic-live",
		"aria-live": "polite",
		children: [i, /* @__PURE__ */ b("span", {
			className: "aic-doing",
			children: "Waiting on your decision"
		})]
	}) : n.kind === "running" ? /* @__PURE__ */ x("div", {
		className: "aic-status aic-live",
		"aria-live": "polite",
		children: [
			i,
			/* @__PURE__ */ b("span", {
				className: "aic-doing",
				children: n.doing
			}),
			/* @__PURE__ */ x("em", {
				className: "aic-clock",
				children: [Math.max(0, Math.round((t - n.started) / 1e3)), "s"]
			})
		]
	}) : /* @__PURE__ */ b("div", {
		className: "aic-status",
		"aria-live": "polite",
		children: n.text
	});
}
function ie({ view: e, controller: t }) {
	let n = e.permission;
	return n ? /* @__PURE__ */ b(s, {
		tone: "warning",
		className: "aic-permission",
		title: n.title,
		actions: /* @__PURE__ */ x(y, { children: [
			/* @__PURE__ */ b(c, {
				variant: "primary",
				size: "sm",
				onClick: () => t.answerPermission("allow"),
				children: "Allow"
			}),
			n.canAlwaysAllow && /* @__PURE__ */ b(c, {
				variant: "ghost",
				size: "sm",
				title: "Allow this for the rest of the session, without asking again",
				onClick: () => t.answerPermission("allow_always"),
				children: "Always allow"
			}),
			/* @__PURE__ */ b(c, {
				variant: "ghost",
				size: "sm",
				onClick: () => t.answerPermission("deny"),
				children: "Deny"
			})
		] }),
		children: n.description || void 0
	}) : null;
}
var ae = /(^|\s)@([^\n@]{0,60})$/, k = 8;
function A(e, t) {
	let n = ae.exec(e.slice(0, t));
	return n ? {
		at: n.index + n[1].length,
		query: n[2]
	} : null;
}
function oe({ id: e, items: t, active: n, onPick: r, onHover: i }) {
	return /* @__PURE__ */ b("ul", {
		className: "aic-picker",
		role: "listbox",
		id: e,
		"aria-label": "Add to context",
		children: t.map((t, a) => /* @__PURE__ */ b("li", {
			id: `${e}-${a}`,
			role: "option",
			"aria-selected": a === n,
			className: "aic-pick",
			onMouseDown: (e) => e.preventDefault(),
			onMouseEnter: () => i(a),
			onClick: () => r(t),
			children: t.title
		}, t.id))
	});
}
function se({ view: n, controller: r, draft: a, setDraft: o, input: s }) {
	let l = t(), [u, d] = i(null), [f, p] = i(0), [h, g] = i("");
	e(() => {
		d(null), g("");
	}, [n.openId]);
	let v = n.mentionable && u && !n.busy ? r.findMentions(u.query).filter((e) => !n.attached.some((t) => t.id === e.id)).slice(0, k) : [], y = v.length > 0, S = (e, t) => {
		if (!n.mentionable) return;
		let r = A(e, t), i = r ? e.slice(0, r.at + 1) : "";
		if (i !== h && g(""), r && i === h) {
			d(null);
			return;
		}
		(r?.query !== u?.query || r?.at !== u?.at) && p(0), d(r);
	}, C = (e) => {
		if (!u) return;
		let t = s.current, n = t ? t.selectionStart : a.length;
		o(a.slice(0, u.at) + a.slice(n)), d(null), r.attach(e), requestAnimationFrame(() => {
			t?.focus(), t?.setSelectionRange(u.at, u.at);
		});
	};
	e(() => {
		if (!y) return;
		let e = (e) => {
			if (e.key !== "Escape") return;
			e.stopPropagation(), e.preventDefault();
			let t = s.current;
			u && t && g(t.value.slice(0, u.at + 1)), d(null);
		};
		return window.addEventListener("keydown", e, !0), () => window.removeEventListener("keydown", e, !0);
	}, [y, u]);
	let w = (e) => {
		e?.preventDefault(), r.send(a) ? (o(""), d(null)) : s.current?.focus();
	}, T = (e) => {
		if (!e.nativeEvent.isComposing) {
			if (y) {
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault();
					let t = e.key === "ArrowDown" ? 1 : -1;
					p((e) => (e + t + v.length) % v.length);
					return;
				}
				if (e.key === "Enter" && !e.shiftKey || e.key === "Tab" && !e.shiftKey) {
					e.preventDefault(), C(v[Math.min(f, v.length - 1)]);
					return;
				}
			}
			e.key === "Enter" && !e.shiftKey && (e.preventDefault(), w());
		}
	}, E = n.mentionable ? {
		role: "combobox",
		"aria-autocomplete": "list",
		"aria-expanded": y,
		"aria-controls": y ? l : void 0,
		"aria-activedescendant": y ? `${l}-${Math.min(f, v.length - 1)}` : void 0,
		"data-tenon-editing": y ? "" : void 0
	} : {};
	return /* @__PURE__ */ x("form", {
		className: "aic-foot",
		autoComplete: "off",
		onSubmit: w,
		children: [
			y && /* @__PURE__ */ b(oe, {
				id: l,
				items: v,
				active: Math.min(f, v.length - 1),
				onPick: C,
				onHover: p
			}),
			n.attached.length > 0 && /* @__PURE__ */ b("div", {
				className: "aic-attached",
				children: n.attached.map((e) => /* @__PURE__ */ x(m, {
					tone: "accent",
					className: "aic-chip",
					title: e.title,
					children: [/* @__PURE__ */ b("span", {
						className: "aic-chiptext",
						children: e.title
					}), /* @__PURE__ */ b("button", {
						type: "button",
						className: "aic-unattach",
						"aria-label": `Remove ${e.title}`,
						onClick: () => {
							r.detach(e.id), s.current?.focus();
						},
						children: "×"
					})]
				}, e.id))
			}),
			/* @__PURE__ */ b(_, {
				ref: s,
				autoGrow: !0,
				className: "aic-input",
				placeholder: n.placeholder,
				spellCheck: !1,
				value: a,
				disabled: n.busy,
				onChange: (e) => {
					o(e.target.value), S(e.target.value, e.target.selectionStart);
				},
				onSelect: (e) => S(e.currentTarget.value, e.currentTarget.selectionStart),
				onBlur: () => d(null),
				onKeyDown: T,
				autoFocus: !0,
				...E
			}),
			n.busy ? /* @__PURE__ */ b(c, {
				type: "button",
				variant: "secondary",
				className: "aic-stop",
				onClick: r.stop,
				children: "Stop"
			}) : /* @__PURE__ */ b(c, {
				type: "submit",
				variant: "primary",
				className: "aic-send",
				children: "Send"
			})
		]
	});
}
function j({ controller: t }) {
	let n = D(t), [a, o] = i(""), s = r(null);
	e(() => {
		n.openId && o(t.takeSeed());
	}, [n.openId, t]);
	let l = n.renamable ? /* @__PURE__ */ b(u, {
		value: n.title,
		onCommit: t.rename
	}) : n.title, f = n.ownerLabel || n.subtitle ? /* @__PURE__ */ x(y, { children: [n.ownerLabel && /* @__PURE__ */ b("span", {
		className: "aic-for",
		children: n.ownerLabel
	}), n.subtitle && /* @__PURE__ */ b("span", {
		className: "aic-sub",
		children: n.subtitle
	})] }) : void 0, m = n.writeSwitch ? /* @__PURE__ */ x("label", {
		className: "aic-write",
		title: "Lets Claude create and edit files inside its working folder, from your next message",
		children: [/* @__PURE__ */ b(g, {
			checked: n.canWrite,
			onChange: t.setWrite,
			"aria-label": "Can write"
		}), /* @__PURE__ */ b("span", { children: "Can write" })]
	}) : null, h = n.desktopHref ? /* @__PURE__ */ b(d, {
		variant: "ghost",
		size: "sm",
		className: "aic-desktop",
		href: n.desktopHref,
		target: "_blank",
		rel: "noopener",
		title: "Imports this session into Claude Desktop and carries it on there",
		children: "Open in Claude"
	}) : null, _ = m || h ? /* @__PURE__ */ x(y, { children: [m, h] }) : void 0, S = /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(ie, {
		view: n,
		controller: t
	}), /* @__PURE__ */ b(te, {
		view: n,
		controller: t,
		onEdit: (e) => {
			o(e), s.current?.focus();
		}
	})] }), C = /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(re, { view: n }), /* @__PURE__ */ b(se, {
		view: n,
		controller: t,
		draft: a,
		setDraft: o,
		input: s
	})] }), w = n.presentation;
	if (n.dockable && w.dock !== "none") {
		let e = w.dock === "minimised", r = (e) => {
			t.pressed();
			let n = e.target;
			n.closest(".tenon-window__head") && !n.closest("button,a,input,textarea,[contenteditable=\"true\"]") && e.stopPropagation();
		}, i = n.status.kind === "permission" ? "Needs you" : n.status.kind === "running" ? n.status.doing : n.runState || "", a = e ? /* @__PURE__ */ b("span", {
			className: "aic-dockstate",
			children: i
		}) : /* @__PURE__ */ x(y, { children: [
			_,
			/* @__PURE__ */ b(c, {
				variant: "ghost",
				size: "sm",
				iconOnly: !0,
				className: "aic-minimise",
				"aria-label": "Minimise",
				title: "Minimise",
				onClick: t.minimise,
				children: "–"
			}),
			/* @__PURE__ */ b(c, {
				variant: "ghost",
				size: "sm",
				iconOnly: !0,
				className: "aic-expand",
				"aria-label": "Expand",
				title: "Expand",
				onClick: t.expand,
				children: "⤢"
			})
		] });
		return /* @__PURE__ */ b(v, {
			open: n.open,
			onClose: t.closeChat,
			closeButton: !n.pinned,
			title: e ? n.title : l,
			subtitle: e ? void 0 : f,
			headEnd: a,
			footer: e ? void 0 : C,
			bare: !0,
			className: "aic-box aic-docked " + (e ? "aic-minimised" : "aic-anchored") + (n.pinned ? " aic-pinned" : ""),
			"data-state": n.runState || void 0,
			rect: w.dockRect,
			zIndex: w.zIndex,
			active: w.active && !e,
			onPointerDownCapture: r,
			onClick: e ? (e) => {
				e.target.closest("button,a") || t.anchor();
			} : void 0,
			children: e ? null : S
		});
	}
	let T = n.dockable ? /* @__PURE__ */ x(y, { children: [_, /* @__PURE__ */ b(c, {
		variant: "ghost",
		size: "sm",
		iconOnly: !0,
		className: "aic-minimise",
		"aria-label": "Minimise",
		title: "Minimise",
		onClick: t.minimise,
		children: "–"
	})] }) : _;
	return n.windowed ? /* @__PURE__ */ b(v, {
		open: n.open,
		onClose: t.closeChat,
		title: l,
		subtitle: f,
		headEnd: T,
		footer: C,
		bare: !0,
		className: "aic-box",
		"data-state": n.runState || void 0,
		rect: w.rect,
		growFrom: w.growFrom,
		zIndex: w.zIndex,
		active: w.active,
		peeked: w.peeked,
		onRectLive: t.rectLive,
		onRectChange: t.rectChange,
		onFocus: t.pressed,
		children: S
	}) : /* @__PURE__ */ b(p, {
		open: n.open,
		onClose: t.closeChat,
		title: l,
		subtitle: f,
		headEnd: T,
		footer: C,
		size: "lg",
		bare: !0,
		className: "aic-box aic-modal",
		children: S
	});
}
//#endregion
//#region src/format.ts
var ce = {
	Read: "file_path",
	Edit: "file_path",
	Write: "file_path",
	Glob: "pattern",
	Grep: "pattern",
	Bash: "command",
	WebFetch: "url",
	WebSearch: "query",
	Skill: "skill",
	Task: "description"
};
function M(e, t, n) {
	let r = t || {}, i = ce[e], a = i && r[i] ? String(r[i]) : "";
	return a ||= Object.values(r).find((e) => typeof e == "string") || "", n && a.indexOf(n + "/") === 0 && (a = a.slice(n.length + 1)), a = a.replace(/\s+/g, " ").trim(), a.length > 70 && (a = a.slice(0, 69) + "…"), a ? e + " " + a : e;
}
var le = {
	starting: "Starting up",
	thinking: "Thinking it through",
	writing: "Writing the answer",
	Read: "Reading a file",
	Glob: "Looking for files",
	Grep: "Searching the text",
	Bash: "Running a command",
	Edit: "Editing a file",
	Write: "Writing a file",
	Skill: "Loading a skill",
	Task: "Handing part of it to a subagent",
	WebFetch: "Fetching a page",
	WebSearch: "Searching the web",
	done: "Finished"
};
function ue(e) {
	return le[e] || (e ? "Using " + e : "Working");
}
function de(e) {
	return e < .01 ? "under 1¢" : "$" + e.toFixed(2);
}
function fe(e) {
	let t = Math.max(1, Math.round((e.ms || Date.now() - e.started) / 1e3)), n = [e.status === "done" ? "done" : "stopped", t + "s"];
	return e.cost && n.push(de(e.cost)), n.join(" · ");
}
function N(e) {
	let t = String(e).replace(/\s+/g, " ").trim(), n = /[.?!]\s/.exec(t);
	return n && n.index > 12 && (t = t.slice(0, n.index + 1)), t.length > 54 && (t = t.slice(0, 54).replace(/\s+\S*$/, "") + "…"), t.replace(/[.,;:\s]+$/, "");
}
function P(e) {
	return new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
}
function F(e) {
	let t = new Date(e || "");
	if (isNaN(t.getTime())) return "";
	let n = Math.floor((P(/* @__PURE__ */ new Date()) - P(t)) / 864e5);
	return n <= 0 ? "today" : n === 1 ? "yesterday" : n < 7 ? n + " days ago" : t.toLocaleDateString(void 0, {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function I(e) {
	return "claude://resume?session=" + encodeURIComponent(e);
}
//#endregion
//#region src/transport.ts
var L = {
	status: "/claude.json",
	sessions: "/claude/sessions.json",
	transcript: "/claude/transcript.json",
	forget: "/claude/forget",
	run: "/claude"
};
function R(e, t) {
	let n = (e) => ({
		...e || {},
		[t.name]: t.value
	}), r = async (e) => {
		let t = await fetch(e, { cache: "no-store" });
		if (!t.ok) throw Error("HTTP " + t.status);
		return t.json();
	};
	return {
		status: () => r(e.status + "?t=" + Date.now()),
		sessions: () => r(e.sessions + "?t=" + Date.now()),
		transcript: (t, n) => r(e.transcript + "?session=" + encodeURIComponent(t) + "&cwd=" + encodeURIComponent(n || "")),
		async *run(t, r) {
			let i;
			try {
				i = await fetch(e.run, {
					method: "POST",
					headers: n({ "Content-Type": "application/json" }),
					body: JSON.stringify(t),
					signal: r
				});
			} catch {
				throw Error(r.aborted ? "Stopped." : "Could not reach the helper — is it still running?");
			}
			if (!i.ok) {
				let e = "The helper refused it (HTTP " + i.status + ")";
				try {
					let t = await i.json();
					t && t.error && (e = t.error);
				} catch {}
				throw Error(e);
			}
			let a = i.body.getReader(), o = new TextDecoder(), s = "";
			try {
				for (;;) {
					let e = await a.read();
					if (e.done) break;
					s += o.decode(e.value, { stream: !0 });
					let t;
					for (; (t = s.indexOf("\n")) >= 0;) {
						let e = s.slice(0, t).trim();
						s = s.slice(t + 1), e && (yield e);
					}
				}
			} catch (e) {
				throw Error("The answer stopped coming: " + (e.message || e));
			}
		},
		async forget(t, r) {
			await fetch(e.forget, {
				method: "POST",
				headers: n({ "Content-Type": "application/json" }),
				body: JSON.stringify({
					owner: t,
					session: r
				})
			});
		},
		answerPermission: e.permission ? async (t, r) => {
			await fetch(e.permission, {
				method: "POST",
				headers: n({ "Content-Type": "application/json" }),
				body: JSON.stringify({
					requestId: t,
					decision: r
				})
			});
		} : void 0
	};
}
//#endregion
//#region src/dock.ts
var z = 16, B = 12, V = 300, pe = 52, H = 400, me = 560, U = [], W = /* @__PURE__ */ new Set(), G = !1;
function K() {
	W.forEach((e) => e());
}
var he = K;
function ge(e) {
	return W.add(e), () => {
		W.delete(e);
	};
}
function _e(e) {
	U.includes(e) || U.push(e), !G && typeof window < "u" && (G = !0, window.addEventListener("resize", K)), K();
}
function q(e) {
	let t = U.indexOf(e);
	t < 0 || (U.splice(t, 1), K());
}
function ve() {
	return [...U.filter((e) => e.pinned?.()), ...U.filter((e) => !e.pinned?.())];
}
function J(e) {
	let t = ve(), n = t.indexOf(e);
	if (n < 0) return null;
	let r = typeof window < "u" ? window.innerWidth : 1280, i = typeof window < "u" ? window.innerHeight : 800, a = r - z;
	for (let e = 0; e < n; e++) a -= (t[e].dockState() === "anchored" ? H : V) + B;
	let o = e.dockState() === "anchored", s = o ? H : V, c = o ? Math.min(me, i - 32) : pe;
	return {
		x: a - s,
		y: i - c,
		width: s,
		height: c
	};
}
//#endregion
//#region src/controller.ts
function ye(e) {
	return e ? "(Writing is now switched on for this conversation: you can create and edit files inside the working directory, and nothing outside it. Anything said earlier about not being able to write no longer holds.)" : "(Writing is now switched off again for this conversation: you can read, but not create or edit files.)";
}
var be = "\n\n<attached>\n", Y = "</attached>", X = (e) => e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), Z = (e) => e.replace(/&quot;/g, "\"").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function Q(e, t) {
	if (!t.length) return e;
	let n = t.map((e) => `<item title="${X(e.title)}"${e.link ? ` link="${X(e.link)}"` : ""}>\n${e.context || ""}\n</item>\n`);
	return e + "\n\n<attached>\nThe person attached these to the message above.\n\n" + n.join("\n") + Y;
}
function xe(e) {
	let t = e.lastIndexOf(be);
	if (t < 0 || !e.endsWith(Y)) return {
		ask: e,
		mentions: []
	};
	let n = [], r = /<item title="([^"]*)"(?: link="([^"]*)")?>\n([\s\S]*?)\n<\/item>/g;
	for (let i; i = r.exec(e.slice(t));) n.push({
		id: "disk-" + n.length,
		title: Z(i[1]),
		link: i[2] ? Z(i[2]) : void 0,
		context: i[3]
	});
	return {
		ask: e.slice(0, t),
		mentions: n
	};
}
var $ = class {
	opts;
	transport;
	windowed;
	defaultMode;
	claudeStatus = null;
	chatsIndex = {};
	runs = {};
	runCounter = 0;
	current = null;
	header = null;
	closing = !1;
	closeTimer = null;
	openId = 0;
	originRect = null;
	growOrigin = null;
	rect = null;
	zIndex;
	active = !0;
	peeked = !1;
	dockable;
	pin;
	dock = "none";
	unDock = null;
	listeners = /* @__PURE__ */ new Set();
	snap = null;
	constructor(e = {}) {
		this.opts = e;
		let t = {
			...L,
			...e.endpoints || {}
		}, n = {
			name: "X-Board",
			value: "1",
			...e.guardHeader || {}
		};
		this.transport = Object.assign(R(t, n), e.transport || {}), this.windowed = !!e.windowed, this.defaultMode = e.mode === "work" || e.mode === "write" ? e.mode : "ask", this.dockable = !!e.dockable, this.pin = this.dockable && !!e.pinned, this.dockable && (this.unDock = ge(() => {
			this.dock !== "none" && this.emit();
		}));
	}
	subscribe = (e) => (this.listeners.add(e), () => {
		this.listeners.delete(e);
	});
	getSnapshot = () => this.snap ??= this.build();
	emit() {
		this.snap = null, this.listeners.forEach((e) => e());
	}
	available = () => !!this.claudeStatus && !(this.opts.isLocked?.() ?? !1);
	status = () => this.claudeStatus;
	home = () => this.claudeStatus ? String(this.claudeStatus.home ?? "") : "";
	isOpen = () => !!this.current;
	sessionsFor = (e) => (e && this.chatsIndex[e] || []).slice().sort((e, t) => String(t.updated || "").localeCompare(String(e.updated || "")));
	newOwnerKey = () => {
		let e = "";
		do
			e = Math.random().toString(36).slice(2, 8);
		while (e.length < 6 || this.chatsIndex[e]);
		return e;
	};
	runFor(e) {
		if (!e) return null;
		let t = Object.values(this.runs).filter((t) => t.session === e);
		return t.length ? t[t.length - 1] : null;
	}
	currentRun() {
		let e = this.current;
		return e ? e.run || this.runFor(e.session) : null;
	}
	currentTurns() {
		let e = this.current;
		if (!e) return [];
		let t = this.currentRun();
		return t ? t.turns : e.turns || [];
	}
	loadStatus = async () => {
		try {
			let e = await this.transport.status();
			this.claudeStatus = e && e.available ? e : null, this.opts.onStatusChanged?.(this.claudeStatus), this.claudeStatus && this.loadSessions();
		} catch {}
	};
	loadSessions = async () => {
		try {
			let e = await this.transport.sessions();
			this.chatsIndex = e && e.chats || {}, this.opts.onSessionsChanged?.(this.chatsIndex), this.current && this.emit(), this.opts.onChange?.();
		} catch {}
	};
	forget = async (e, t) => {
		try {
			await this.transport.forget(e, t);
		} catch {}
		await this.loadSessions();
	};
	openInternal(e, t, n, r, i, a) {
		this.closeTimer &&= (clearTimeout(this.closeTimer), null), this.closing = !1, this.current = {
			owner: e,
			key: t,
			session: n || "",
			seed: r || "",
			mode: this.defaultMode,
			modeNote: "",
			preface: typeof i == "function" ? i : null,
			attached: [],
			turns: null,
			loading: !1,
			run: this.runFor(n)
		}, (a || []).forEach((e) => this.addAttached(e)), this.openId++, this.growOrigin = this.windowed ? this.originRect : null, this.originRect = null, this.emit(), n && !this.runFor(n) && this.loadTranscript(n);
	}
	openNew = (e, t, n, r) => this.openInternal(e, t, "", n || "", r?.preface, r?.attach);
	openSession = (e, t, n) => this.openInternal(e, t, n, "");
	closeChat = () => {
		if (this.current && !this.closing) {
			if (this.pin) {
				this.minimise();
				return;
			}
			if (!(this.windowed && this.growOrigin && !(typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches))) {
				this.finishClose();
				return;
			}
			this.closing = !0, this.emit(), this.closeTimer = setTimeout(() => this.finishClose(), 280);
		}
	};
	finishClose() {
		this.closeTimer &&= (clearTimeout(this.closeTimer), null), this.leaveDock(), this.current = null, this.closing = !1, this.emit(), this.opts.onChange?.();
	}
	async loadTranscript(e) {
		let t = this.current;
		if (!t) return;
		t.loading = !0, this.emit();
		let n = this.sessionsFor(t.key).find((t) => t.id === e), r = n && n.cwd || "";
		try {
			let t = await this.transport.transcript(e, r);
			if (!this.current || this.current.session !== e) return;
			this.current.turns = t.toobig ? [] : t.turns.map((e) => {
				let { ask: t, mentions: n } = xe(e.ask), i = (e.tools || []).map((e) => M(e.name, e.input, r)), a = Array.isArray(e.parts) && e.parts.length ? e.parts.map((e) => e.type === "tool" ? {
					kind: "tool",
					label: M(e.name, e.input, r)
				} : {
					kind: "text",
					text: e.text || ""
				}) : [...i.map((e) => ({
					kind: "tool",
					label: e
				})), ...e.reply ? [{
					kind: "text",
					text: e.reply
				}] : []];
				return {
					ask: t,
					mentions: n,
					reply: e.reply || "",
					error: "",
					detail: "",
					cost: 0,
					tools: i,
					flow: a
				};
			}), this.current.toobig = !!t.toobig;
		} catch {
			this.current && (this.current.loadErr = "That conversation is not on disk any more — Claude Code keeps the transcripts, and this one has been cleared.");
		}
		this.current && (this.current.loading = !1, this.emit());
	}
	handleRunEvent(e, t, n) {
		let r;
		try {
			r = JSON.parse(n);
		} catch {
			return;
		}
		if (e.permission && r.type !== "board_permission" && (e.permission = null), r.type === "board_permission") {
			e.permission = {
				requestId: r.requestId || "",
				toolName: r.toolName || "",
				title: r.title || "Claude wants permission",
				description: r.description || "",
				canAlwaysAllow: !!r.canAlwaysAllow
			}, e.status = "needs_you";
			return;
		}
		if (r.type === "board_start") {
			e.cwd = r.cwd || "", e.home = r.home || "", e.status = "thinking";
			return;
		}
		if (r.type === "board_error") {
			t.error = r.text || "the run failed", r.detail && (t.detail = r.detail);
			return;
		}
		if (r.type === "system" && r.subtype === "init") {
			r.session_id && r.session_id !== e.session && (e.session = r.session_id, this.current && this.current.owner === e.owner && !this.current.session && (this.current.session = r.session_id), this.loadSessions());
			return;
		}
		if (r.type === "assistant" && r.message) {
			for (let n of r.message.content || []) if (n.type === "text" && n.text) {
				let i = (r.message.id || "") + "|" + n.text;
				if (e.seen[i]) continue;
				e.seen[i] = 1, t.reply += (t.reply ? "\n\n" : "") + n.text, t.flow.push({
					kind: "text",
					text: n.text
				}), e.status = "writing";
			} else if (n.type === "thinking") e.status = "thinking";
			else if (n.type === "tool_use") {
				let r = M(n.name, n.input, e.cwd);
				t.tools.push(r), t.flow.push({
					kind: "tool",
					label: r
				}), e.status = n.name;
			}
			return;
		}
		r.type === "result" && (typeof r.result == "string" && r.result.trim() && (t.reply = r.result, t.flow.some((e) => e.kind === "text") || t.flow.push({
			kind: "text",
			text: r.result
		})), r.session_id && (e.session = r.session_id), typeof r.total_cost_usd == "number" && (t.cost = r.total_cost_usd, e.cost += r.total_cost_usd), r.is_error && !t.error && (t.error = "ended in an error (" + (r.subtype || "unknown") + ")"), e.ms = r.duration_ms || Date.now() - e.started, e.status = "done");
	}
	finishRun(e) {
		e.running = !1, e.ctrl = null, e.status !== "done" && (e.status = "stopped"), this.emit(), this.loadSessions(), this.opts.onChange?.();
	}
	async startRun(e) {
		let t = this.runs["n" + ++this.runCounter] = {
			owner: e.owner,
			key: e.key,
			session: e.session || "",
			title: e.title || e.ask,
			mode: e.mode || "ask",
			running: !0,
			status: "starting",
			cwd: "",
			home: this.home(),
			permission: null,
			turns: e.turns.slice(),
			started: Date.now(),
			ms: 0,
			cost: 0,
			seen: {},
			ctrl: new AbortController()
		}, n = {
			ask: e.ask,
			mentions: e.mentions || [],
			reply: "",
			tools: [],
			flow: [],
			error: "",
			detail: "",
			cost: 0
		};
		t.turns.push(n), this.current && this.current.owner === t.owner && (this.current.run = t), this.emit();
		try {
			for await (let r of this.transport.run({
				prompt: e.prompt || e.ask,
				mode: t.mode,
				session: t.session,
				owner: t.key,
				title: t.title
			}, t.ctrl.signal)) this.handleRunEvent(t, n, r), this.emit();
		} catch (e) {
			t.ctrl && t.ctrl.signal.aborted ? n.reply || (n.error = "Stopped.") : n.error = e?.message || String(e);
		}
		this.finishRun(t);
	}
	send = (e) => {
		let t = this.current;
		if (!t) return !1;
		let n = e.trim();
		if (!n) return !1;
		let r = this.currentRun();
		if (r && r.running) return !1;
		let i = t.preface && !t.session ? t.preface(n) : n;
		t.preface &&= null, t.modeNote &&= (t.session && (i = t.modeNote + "\n\n" + i), "");
		let a = t.attached;
		return t.attached = [], i = Q(i, a), this.opts.onSend?.({
			owner: t.owner,
			key: t.key,
			session: t.session || "",
			ask: n,
			prompt: i,
			mode: t.mode || "ask",
			mentions: a.slice()
		}), this.startRun({
			owner: t.owner,
			key: t.key,
			session: t.session,
			ask: n,
			prompt: i,
			mentions: a,
			title: (this.sessionsFor(t.key).find((e) => e.id === t.session) || {}).title || N(n),
			mode: t.mode || "ask",
			turns: r ? r.turns : t.turns || []
		}), !0;
	};
	stop = () => {
		let e = this.currentRun();
		e && e.ctrl && e.ctrl.abort();
	};
	retry = (e) => {
		let t = this.current;
		if (!t) return;
		let n = this.currentTurns()[e], r = this.currentRun();
		if (!n || r && r.running) return;
		let i = n.mentions || [];
		this.startRun({
			owner: t.owner,
			key: t.key,
			session: t.session,
			ask: n.ask,
			mentions: i,
			prompt: Q(n.ask, i),
			title: (this.sessionsFor(t.key).find((e) => e.id === t.session) || {}).title || N(n.ask),
			mode: t.mode || "ask",
			turns: r ? r.turns : t.turns || []
		});
	};
	editText = (e) => {
		let t = this.currentTurns()[e];
		return t ? (this.current && t.mentions?.length && (this.current.attached = [], t.mentions.forEach((e) => this.addAttached(e)), this.emit()), t.ask) : "";
	};
	findMentions = (e) => {
		if (!this.opts.mentions) return [];
		try {
			let t = this.opts.mentions(e);
			return Array.isArray(t) ? t.filter((e) => e && e.id && e.title) : [];
		} catch {
			return [];
		}
	};
	addAttached(e) {
		let t = this.current;
		return !t || !e || !e.id || !e.title || t.attached.some((t) => t.id === e.id) ? !1 : (t.attached.push({ ...e }), !0);
	}
	attach = (e) => {
		this.addAttached(e) && this.emit();
	};
	detach = (e) => {
		let t = this.current;
		if (!t) return;
		let n = t.attached.filter((t) => t.id !== e);
		n.length !== t.attached.length && (t.attached = n, this.emit());
	};
	takeSeed = () => {
		let e = this.current;
		if (!e || !e.seed) return "";
		let t = e.seed;
		return e.seed = "", this.currentTurns().length ? "" : t;
	};
	answerPermission = (e) => {
		let t = this.currentRun();
		if (!t || !t.permission) return;
		let n = t.permission.requestId;
		t.permission = null, this.emit(), this.transport.answerPermission && Promise.resolve(this.transport.answerPermission(n, e)).catch(() => {});
	};
	writeAllowed = () => !!this.opts.writeSwitch && !!this.claudeStatus?.work;
	setWrite = (e) => {
		let t = this.current;
		if (!t || !this.writeAllowed()) return;
		let n = e ? "write" : this.defaultMode === "write" ? "ask" : this.defaultMode;
		t.mode !== n && (t.mode = n, t.modeNote = t.modeNote ? "" : (this.opts.writeNote || ye)(e), this.emit());
	};
	setHeader = (e) => {
		this.header = e || null, this.emit();
	};
	rename = (e) => this.opts.onRename?.(e);
	growFrom = (e) => {
		if (!e) {
			this.originRect = null;
			return;
		}
		let t = e;
		this.originRect = {
			left: t.left ?? t.x,
			top: t.top ?? t.y,
			width: t.width,
			height: t.height
		};
	};
	setRect = (e) => {
		this.windowed && e && (this.rect = {
			x: e.x,
			y: e.y,
			width: e.width,
			height: e.height
		}, this.emit());
	};
	setZIndex = (e) => {
		this.zIndex = e, this.emit();
	};
	setActive = (e) => {
		this.active = !!e, this.emit();
	};
	setPeeked = (e) => {
		this.peeked = !!e, this.emit();
	};
	dockState = () => this.dock;
	pinned = () => this.pin;
	running = () => Object.values(this.runs).some((e) => e.running);
	setDock(e) {
		if (!this.dockable || !this.current || this.dock === e) return;
		let t = this.dock;
		this.dock = e, e === "none" ? (q(this), this.emit()) : t === "none" ? _e(this) : he();
	}
	leaveDock() {
		this.dock !== "none" && (this.dock = "none", q(this));
	}
	minimise = () => this.setDock("minimised");
	anchor = () => this.setDock("anchored");
	expand = () => this.setDock("none");
	rectLive = (e) => this.opts.onRectLive?.(e);
	rectChange = (e) => {
		this.rect = e, this.opts.onRectChange?.(e);
	};
	pressed = () => this.opts.onFocus?.();
	destroy = () => {
		for (let e of Object.keys(this.runs)) {
			let t = this.runs[e];
			if (t && t.ctrl) try {
				t.ctrl.abort();
			} catch {}
			delete this.runs[e];
		}
		this.closeTimer &&= (clearTimeout(this.closeTimer), null), this.leaveDock(), this.unDock?.(), this.unDock = null, this.current = null, this.closing = !1, this.listeners.clear();
	};
	build() {
		let e = this.current, t = this.currentRun(), n = e ? this.sessionsFor(e.key).find((t) => t.id === e.session) : void 0, r = n && n.title || t && t.title || "New chat", i = !!(t && t.running), a;
		return a = e ? t && t.permission ? { kind: "permission" } : t && t.running ? {
			kind: "running",
			doing: ue(t.status),
			started: t.started,
			phase: t.status
		} : t ? {
			kind: "text",
			text: (t.mode === "work" ? "Claude, working in " : t.mode === "write" ? "Claude, writing in " : "Claude, reading in ") + (t.home || "") + " · " + fe(t)
		} : e.loading ? {
			kind: "text",
			text: "Reading the transcript…"
		} : e.session ? {
			kind: "text",
			text: "Earlier conversation · " + (n && F(n.updated) || "")
		} : {
			kind: "text",
			text: "New conversation in " + this.home() + " · " + (e.mode === "work" ? "can write" : e.mode === "write" ? "can edit files" : "reads only")
		} : {
			kind: "text",
			text: ""
		}, {
			open: !!e && !this.closing,
			openId: this.openId,
			windowed: this.windowed,
			owner: e?.owner ?? "",
			session: e?.session ?? "",
			title: this.header && this.header.title || r,
			ownerLabel: e && this.opts.ownerLabel?.(e.owner) || "",
			subtitle: this.header && this.header.subtitle || "",
			runState: this.header && this.header.runState || "",
			desktopHref: this.opts.desktopLink !== !1 && e && e.session ? I(e.session) : null,
			status: a,
			turns: this.currentTurns().map((e) => ({
				...e,
				tools: e.tools.slice(),
				flow: e.flow.slice()
			})),
			busy: i,
			loading: !!e?.loading,
			loadErr: e?.loadErr ?? "",
			toobig: !!e?.toobig,
			home: this.home(),
			permission: t && t.permission ? { ...t.permission } : null,
			placeholder: this.opts.placeholder || "Ask Claude…",
			inlineTools: !!this.opts.inlineTools,
			thinkingGlyphs: !!this.opts.thinkingGlyphs,
			thinkingOrbs: !!this.opts.thinkingOrbs,
			renamable: typeof this.opts.onRename == "function",
			dockable: this.dockable,
			pinned: this.pin,
			writeSwitch: !!e && this.writeAllowed(),
			canWrite: !!e && e.mode === "write",
			mentionable: typeof this.opts.mentions == "function",
			attached: e ? e.attached.slice() : [],
			presentation: {
				rect: this.rect,
				growFrom: this.growOrigin,
				zIndex: this.zIndex,
				active: this.active,
				peeked: this.peeked,
				dock: this.dock,
				dockRect: this.dock === "none" ? null : J(this)
			}
		};
	}
};
//#endregion
//#region src/create.tsx
function Se(e = {}) {
	let t = new $(e), n = null, r = null, i = () => {
		r || (n = document.createElement("div"), n.setAttribute("data-ai-chat", ""), document.body.appendChild(n), r = S(n), r.render(/* @__PURE__ */ b(j, { controller: t })));
	};
	return {
		loadStatus: t.loadStatus,
		loadSessions: t.loadSessions,
		available: t.available,
		status: t.status,
		home: t.home,
		sessionsFor: t.sessionsFor,
		newOwnerKey: t.newOwnerKey,
		forget: t.forget,
		isOpen: t.isOpen,
		closeChat: t.closeChat,
		openNew(e, n, r, a) {
			i(), t.openNew(e, n, r, a);
		},
		openSession(e, n, r) {
			i(), t.openSession(e, n, r);
		},
		growFrom: t.growFrom,
		setRect: t.setRect,
		setZIndex: t.setZIndex,
		setActive: t.setActive,
		setPeeked: t.setPeeked,
		setHeader: t.setHeader,
		minimise: t.minimise,
		anchor: t.anchor,
		expand: t.expand,
		dockState: t.dockState,
		setWrite: t.setWrite,
		canWrite: () => t.getSnapshot().canWrite,
		attach: t.attach,
		detach: t.detach,
		attached: () => t.getSnapshot().attached,
		running: t.running,
		session: () => t.getSnapshot().session,
		destroy() {
			t.destroy(), r?.unmount(), n?.remove(), r = null, n = null;
		}
	};
}
//#endregion
export { $ as ChatController, j as ChatWindow, L as DEFAULT_ENDPOINTS, N as chatTitle, Se as create, I as desktopHref, R as makeDefaultTransport, M as toolLabel, D as useChat, F as whenLabel };
