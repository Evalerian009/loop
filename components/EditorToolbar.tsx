"use client";

import { Editor, useEditorState } from "@tiptap/react";
import clsx from "clsx";
import {
  LuBold,
  LuCode,
  LuItalic,
  LuRedo,
  LuRemoveFormatting,
  LuStrikethrough,
  LuUndo,
} from "react-icons/lu";
import {
  PiCodeBlock,
  PiParagraph,
  PiQuotes,
  PiArrowElbowDownLeftFill,
} from "react-icons/pi";
import { LiaListAlt, LiaListOlSolid } from "react-icons/lia";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import Tooltip from "./Tooltip";

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

type EditorState = {
  isBold: boolean;
  canBold: boolean;
  isItalic: boolean;
  canItalic: boolean;
  isStrike: boolean;
  canStrike: boolean;
  isCode: boolean;
  canCode: boolean;
  canClearMarks: boolean;
  isParagraph: boolean;
  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isHeading4: boolean;
  isHeading5: boolean;
  isHeading6: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isCodeBlock: boolean;
  isBlockquote: boolean;
  canUndo: boolean;
  canRedo: boolean;
};


function ToolbarButton({ onClick, active, disabled, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-2 py-1 rounded",
        active && "bg-[var(--accent)] text-white",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

// default fallback state when editor is null
const EMPTY_STATE = {
  isBold: false,
  canBold: false,
  isItalic: false,
  canItalic: false,
  isStrike: false,
  canStrike: false,
  isCode: false,
  canCode: false,
  canClearMarks: false,
  isParagraph: false,
  isHeading1: false,
  isHeading2: false,
  isHeading3: false,
  isHeading4: false,
  isHeading5: false,
  isHeading6: false,
  isBulletList: false,
  isOrderedList: false,
  isCodeBlock: false,
  isBlockquote: false,
  canUndo: false,
  canRedo: false,
};

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  // ✅ always call hook
  const state = useEditorState<EditorState>({
    editor: editor!,
    selector: (ctx) => {
      if (!editor) return EMPTY_STATE;

      return {
        isBold: ctx.editor.isActive("bold"),
        canBold: ctx.editor.can().chain().toggleBold().run(),

        isItalic: ctx.editor.isActive("italic"),
        canItalic: ctx.editor.can().chain().toggleItalic().run(),

        isStrike: ctx.editor.isActive("strike"),
        canStrike: ctx.editor.can().chain().toggleStrike().run(),

        isCode: ctx.editor.isActive("code"),
        canCode: ctx.editor.can().chain().toggleCode().run(),

        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run(),

        isParagraph: ctx.editor.isActive("paragraph"),

        isHeading1: ctx.editor.isActive("heading", { level: 1 }),
        isHeading2: ctx.editor.isActive("heading", { level: 2 }),
        isHeading3: ctx.editor.isActive("heading", { level: 3 }),
        isHeading4: ctx.editor.isActive("heading", { level: 4 }),
        isHeading5: ctx.editor.isActive("heading", { level: 5 }),
        isHeading6: ctx.editor.isActive("heading", { level: 6 }),

        isBulletList: ctx.editor.isActive("bulletList"),
        isOrderedList: ctx.editor.isActive("orderedList"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isBlockquote: ctx.editor.isActive("blockquote"),

        canUndo: ctx.editor.can().chain().undo().run(),
        canRedo: ctx.editor.can().chain().redo().run(),
      };
    },
  });

  // ✅ only return null *after* hook runs
  if (!editor) return null;

  const divider = <span className="w-px bg-[var(--muted)] mx-1" />;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 mb-2 border-b border-[var(--muted)]">
      {/* Marks */} 
      
      <Tooltip content="Bold (Ctrl+B)"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={state.isBold} 
          disabled={!state.canBold} > <LuBold /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Italic (Ctrl+I)"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={state.isItalic} 
          disabled={!state.canItalic} > <LuItalic /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Strikethrough"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          active={state.isStrike} 
          disabled={!state.canStrike} > <LuStrikethrough /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Inline Code"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          active={state.isCode} 
          disabled={!state.canCode} > <LuCode /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Clear Marks"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().unsetAllMarks().run()} 
          disabled={!state.canClearMarks} > <LuRemoveFormatting /> 
        </ToolbarButton> 
      </Tooltip> {divider} {/* Blocks */} 
      
      <Tooltip content="Paragraph"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().setParagraph().run()} 
          active={state.isParagraph} > <PiParagraph /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Heading 1"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          active={state.isHeading1} > H1 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Heading 2"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={state.isHeading2} > H2 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Heading 3"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          active={state.isHeading3} > H3 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Heading 4"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} 
          active={state.isHeading4} > H4 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Heading 5"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} 
          active={state.isHeading5} > H5 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Heading 6"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} 
          active={state.isHeading6} > H6 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Bullet List"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={state.isBulletList} > <LiaListAlt /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Ordered List"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          active={state.isOrderedList} > <LiaListOlSolid /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Code Block"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          active={state.isCodeBlock} > <PiCodeBlock /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Blockquote"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          active={state.isBlockquote} > <PiQuotes /> 
        </ToolbarButton> 
      </Tooltip> {divider} {/* Extras */} 
      
      <Tooltip content="Horizontal Rule"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().setHorizontalRule().run()}> <TfiLayoutLineSolid /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Hard Break"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().setHardBreak().run()}> <PiArrowElbowDownLeftFill /> 
        </ToolbarButton> 
      </Tooltip> {divider} {/* History */} 
      
      <Tooltip content="Undo (Ctrl+Z)"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!state.canUndo} > <LuUndo /> 
        </ToolbarButton> 
      </Tooltip> 
      
      <Tooltip content="Redo (Ctrl+Y)"> 
        <ToolbarButton 
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!state.canRedo} > <LuRedo /> 
        </ToolbarButton> 
      </Tooltip>
    </div>
  );
}
