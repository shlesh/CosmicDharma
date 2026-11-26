// The Markdown editor is the heaviest thing on the admin screen. It lives in its own module so
// AdminDashboard can load it with next/dynamic only when a post is opened for editing.
// Same editor as the /editor page (BlogEditor), so the app ships one editor library, not two.
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

export default function MarkdownEditor({ markdown, onChange }: { markdown: string; onChange: (md: string) => void }) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={markdown}
        onChange={(val) => onChange(val || '')}
        preview="live"
        height={400}
        textareaProps={{ 'aria-label': 'Content' }}
      />
    </div>
  );
}
