"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { useCallback, useRef, useState, useEffect } from "react";

// ─── Toolbar icons ────────────────────────────────────────────────────────────

const B       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>;
const Italic  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>;
const Und     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>;
const Quote   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>;
const Code    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const Hr      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="2" y1="12" x2="22" y2="12"/></svg>;
const UL      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const OL      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
const ImgIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const LinkIcon= () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;

// ─── Toolbar button ───────────────────────────────────────────────────────────

function Btn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`flex items-center justify-center w-8 h-8 rounded text-sm transition-colors
        ${active ? "bg-brand-primary text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
        disabled:opacity-30 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-primary`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-6 bg-gray-200 mx-1" aria-hidden="true" />;
}

// ─── Custom floating selection menu (replaces Tiptap BubbleMenu, removed in v3) ─

function BubbleMenu({ editor, containerRef }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { from, to, empty } = editor.state.selection;
      if (empty) { setPos(null); return; }

      const container = containerRef.current;
      if (!container) return;

      const startCoords = editor.view.coordsAtPos(from);
      const endCoords   = editor.view.coordsAtPos(to);
      const rect        = container.getBoundingClientRect();

      const midX  = (startCoords.left + endCoords.left) / 2;
      const left  = Math.max(0, midX - rect.left - 72); // 72 = half bubble width ~144px
      const top   = startCoords.top - rect.top - 48;    // 48px above the selection

      setPos({ top: Math.max(4, top), left });
    };

    editor.on("selectionUpdate", update);
    editor.on("blur", () => setPos(null));

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("blur", () => setPos(null));
    };
  }, [editor, containerRef]);

  if (!pos || !editor) return null;

  const btn = (label, onClick, active, cls = "") => (
    <button
      key={label}
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${cls}
        ${active ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"}`}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 50 }}
      className="flex items-center gap-0.5 bg-gray-900 rounded-lg px-1.5 py-1 shadow-xl pointer-events-auto"
      onMouseDown={(e) => e.preventDefault()}
    >
      {btn("B",  () => editor.chain().focus().toggleBold().run(),      editor.isActive("bold"),      "font-bold")}
      {btn("I",  () => editor.chain().focus().toggleItalic().run(),    editor.isActive("italic"),    "italic")}
      {btn("U",  () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"), "underline")}
    </div>
  );
}

// ─── Editor ──────────────────────────────────────────────────────────────────

export default function RichTextEditor({ content, onChange }) {
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: "Write your press release here…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CharacterCount,
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "article-body outline-none min-h-[400px] px-1 py-2" },
    },
  });

  const addImage = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.chain().focus().setImage({ src: ev.target.result, alt: file.name }).run();
    };
    reader.readAsDataURL(file);
  }, [editor]);

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes("link").href || "";
    const url  = window.prompt("Enter URL", prev);
    if (url === null) return;
    if (url === "") { editor?.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const wordCount = editor.storage.characterCount?.words() ?? 0;
  const readTime  = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">

        {[1, 2, 3].map((level) => (
          <Btn key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive("heading", { level })}
            title={`Heading ${level}`}
          >
            <span className="text-xs font-bold">H{level}</span>
          </Btn>
        ))}

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive("bold")}      title="Bold (Ctrl+B)"><B /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive("italic")}    title="Italic (Ctrl+I)"><Italic /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)"><Und /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()}      active={editor.isActive("code")}      title="Inline code"><Code /></Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive("bulletList")}  title="Bullet list"><UL /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list"><OL /></Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}  active={editor.isActive("blockquote")} title="Blockquote"><Quote /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()}   active={editor.isActive("codeBlock")}  title="Code block">
          <span className="text-xs font-mono font-bold">{`</>`}</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider line"><Hr /></Btn>

        <Sep />

        <Btn onClick={addImage} active={false}                   title="Insert image"><ImgIcon /></Btn>
        <Btn onClick={setLink}  active={editor.isActive("link")} title="Insert / edit link"><LinkIcon /></Btn>

        <div className="ml-auto text-xs text-gray-400 flex items-center gap-2 pr-1">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {/* ── Editor area + custom bubble menu ── */}
      <div ref={containerRef} className="relative px-8 py-6 min-h-[400px]">
        <BubbleMenu editor={editor} containerRef={containerRef} />
        <EditorContent editor={editor} />
      </div>

      {/* Hidden file input for image upload */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
