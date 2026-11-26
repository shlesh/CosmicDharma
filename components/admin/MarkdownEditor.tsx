// The rich Markdown editor (MDXEditor + CodeMirror) is the heaviest thing on the admin screen.
// It lives in its own module so AdminDashboard can load it with next/dynamic only when a post
// is opened for editing.
import {
  MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin,
  linkPlugin, linkDialogPlugin, imagePlugin, tablePlugin, codeBlockPlugin, codeMirrorPlugin,
  toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, CreateLink, InsertImage, InsertTable,
  InsertThematicBreak, ListsToggle,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

export default function MarkdownEditor({ markdown, onChange }: { markdown: string; onChange: (md: string) => void }) {
  return (
    <MDXEditor
      markdown={markdown}
      onChange={onChange}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
        codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text' } }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <ListsToggle />
            </>
          ),
        }),
      ]}
      className="min-h-[300px]"
    />
  );
}
