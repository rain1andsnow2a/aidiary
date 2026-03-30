// 富文本编辑器 - 基于 Lexical，支持图片上传
import { useEffect, useRef, useCallback, useState } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getRoot, $createParagraphNode, $createTextNode,
  FORMAT_TEXT_COMMAND, EditorState, LexicalEditor
} from 'lexical'
import { $generateHtmlFromNodes } from '@lexical/html'
import { Bold, Italic, Image as ImageIcon, Loader2 } from 'lucide-react'
import { diaryService } from '@/services/diary.service'
import { toast } from '@/components/ui/toast'

// ---- Toolbar button ----
function ToolbarBtn({
  children, onClick, title, disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-500 hover:bg-rose-100 hover:text-rose-500 transition-colors disabled:opacity-40"
    >
      {children}
    </button>
  )
}

// ---- Toolbar ----
function ToolbarPlugin({ onImageInsert }: { onImageInsert: (url: string) => void }) {
  const [editor] = useLexicalComposerContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await diaryService.uploadImage(file)
      onImageInsert(url)
    } catch {
      toast('图片上传失败', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-rose-50 bg-rose-50/30">
      <ToolbarBtn title="加粗" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
        <Bold className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <ToolbarBtn title="斜体" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}>
        <Italic className="w-3.5 h-3.5" />
      </ToolbarBtn>
      <div className="w-px h-4 bg-stone-200 mx-1" />
      <ToolbarBtn title="插入图片" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <ImageIcon className="w-3.5 h-3.5" />}
      </ToolbarBtn>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  )
}

// ---- Image insertion plugin ----
function ImageInsertPlugin({
  pendingUrl, onInserted,
}: { pendingUrl: string | null; onInserted: () => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!pendingUrl) return
    editor.update(() => {
      const root = $getRoot()
      const p = $createParagraphNode()
      p.append($createTextNode(`![图片](${pendingUrl})`))
      root.append(p)
    })
    onInserted()
  }, [pendingUrl, editor, onInserted])

  return null
}

// ---- Initial value plugin ----
function InitialValuePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !value) return
    initialized.current = true
    editor.update(() => {
      const root = $getRoot()
      if (root.getFirstChild() === null) {
        const p = $createParagraphNode()
        p.append($createTextNode(value))
        root.append(p)
      }
    })
  }, [editor, value])

  return null
}

// ---- Main Editor ----
interface RichTextEditorProps {
  value: string
  onChange: (text: string, html: string) => void
  placeholder?: string
  minHeight?: number
}

const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  paragraph: 'mb-1',
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '今天发生了什么？\n\n你有什么感受？\n\n在这里自由书写，这是只属于你的空间...',
  minHeight = 320,
}: RichTextEditorProps) {
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null)

  const initialConfig = {
    namespace: 'DiaryEditor',
    theme,
    onError: (error: Error) => console.error(error),
  }

  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        const root = $getRoot()
        const text = root.getTextContent()
        const html = $generateHtmlFromNodes(editor)
        onChange(text, html)
      })
    },
    [onChange]
  )

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="flex flex-col">
        <ToolbarPlugin onImageInsert={(url) => setPendingImageUrl(url)} />
        <div className="relative" style={{ minHeight }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="w-full p-6 bg-transparent text-stone-600 text-sm leading-7 outline-none"
                style={{ minHeight }}
              />
            }
            placeholder={
              <div className="absolute top-6 left-6 text-stone-200 text-sm leading-7 pointer-events-none whitespace-pre-line select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={ErrorBoundary}
          />
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
          <InitialValuePlugin value={value} />
          <ImageInsertPlugin
            pendingUrl={pendingImageUrl}
            onInserted={() => setPendingImageUrl(null)}
          />
        </div>
      </div>
    </LexicalComposer>
  )
}
