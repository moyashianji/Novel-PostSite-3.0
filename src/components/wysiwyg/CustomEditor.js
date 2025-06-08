import React, { useRef, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import 'quill-table-ui/dist/index.css'; // quill-table-ui のスタイルをインポート
import TableUI from 'quill-table-ui';
import { Box, Typography, Paper, CircularProgress, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule'; // 改ページアイコンとして水平線アイコンを使用

Quill.register('modules/tableUI', TableUI);

// スタイル付きコンポーネント
const EditorContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${theme.palette.divider}`,
  height: '100%',
}));

const ToolbarContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f9f9f9',
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  '& .ql-formats': {
    marginRight: theme.spacing(1.5),
  },
  '& .ql-picker': {
    color: theme.palette.text.primary,
  },
  '& .ql-stroke': {
    stroke: theme.palette.text.primary,
  },
  '& .ql-fill': {
    fill: theme.palette.text.primary,
  },
  '& .ql-picker-options': {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
  },
  '& button': {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
  },
  '& .ql-active': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
}));

const EditorContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  height: '500px',
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  '& .ql-editor': {
    fontFamily: theme.typography.fontFamily,
    fontSize: '16px',
    lineHeight: 1.6,
    padding: theme.spacing(2),
    minHeight: '450px',
    '&.ql-blank::before': {
      fontStyle: 'normal',
      color: theme.palette.text.secondary,
    },
    '& p': {
      marginBottom: theme.spacing(1.5),
    },
    '& h1, h2, h3': {
      margin: `${theme.spacing(2)} 0 ${theme.spacing(1.5)} 0`,
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
    '& h1': {
      fontSize: '2em',
    },
    '& h2': {
      fontSize: '1.5em',
    },
    '& h3': {
      fontSize: '1.25em',
    },
    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.primary.light}`,
      paddingLeft: theme.spacing(2),
      color: theme.palette.text.secondary,
    },
    '& img': {
      maxWidth: '100%',
      borderRadius: theme.shape.borderRadius,
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& code': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      padding: '2px 4px',
      borderRadius: 4,
      fontFamily: 'monospace',
    },
    '& ul, ol': {
      paddingLeft: theme.spacing(3),
      marginBottom: theme.spacing(1.5),
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    '& td, th': {
      border: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(1),
    },
    '& th': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
      fontWeight: 'bold',
    },
  },
}));

const ToolbarDivider = styled(Divider)(({ theme }) => ({
  margin: `0 ${theme.spacing(0.5)}`,
  height: '24px',
}));

const ToolbarSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  zIndex: 10,
}));

// カスタム改ページボタン
const PageBreakButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  padding: '0 10px',
  cursor: 'pointer',
  height: '24px',
  minWidth: '70px',
  borderRadius: '3px',
  color: theme.palette.text.primary,
  fontSize: '12px',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
}));


const CustomEditor = ({ value, onChange, placeholder = 'コンテンツを入力してください...' }) => {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const quillInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // 改ページを挿入する関数
  const insertPageBreak = () => {
    if (!quillInstance.current) return;
    
    const quill = quillInstance.current;
    const range = quill.getSelection(true);
    
    if (!range) return;
    
    // カーソル位置が行末でない場合、改行を挿入
    const currentPosition = range.index;
    const currentText = quill.getText(currentPosition, 1);
    
    if (currentText && currentText !== '\n') {
      quill.insertText(currentPosition, '\n', Quill.sources.USER);
      quill.setSelection(currentPosition + 1, 0);
    }
    
    // 改ページマーカーを挿入
    const newRange = quill.getSelection();
    quill.insertText(newRange.index, '--page--\n', Quill.sources.USER);
    
    // フォーカスを維持
    quill.setSelection(newRange.index + '--page--\n'.length, 0);
  };

  // エディタの初期化
  useEffect(() => {
    if (editorRef.current && toolbarRef.current && !quillInstance.current) {
      // Quill エディタの初期化
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          table: true,
          tableUI: true,
          toolbar: {
            container: toolbarRef.current,
            handlers: {
              // カスタムハンドラーを必要に応じて追加
              image: function() {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.click();
                
                input.onchange = () => {
                  const file = input.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const img = reader.result;
                      // 現在のカーソル位置に画像を挿入
                      const range = quillInstance.current.getSelection();
                      quillInstance.current.insertEmbed(range.index, 'image', img);
                    };
                    reader.readAsDataURL(file);
                  }
                };
              }
            }
          },
        },
        placeholder: placeholder,
      });

      // イベントリスナーを設定して、変更を親コンポーネントに通知
      quillInstance.current.on('text-change', () => {
        if (onChange) {
          onChange(quillInstance.current.root.innerHTML);
        }
      });

      setIsLoading(false);
    }
  }, [onChange, placeholder]);

  // コンテンツの同期
  useEffect(() => {
    if (quillInstance.current && value !== quillInstance.current.root.innerHTML) {
      quillInstance.current.root.innerHTML = value || '';
    }
  }, [value]);

  return (
    <EditorContainer elevation={0}>
      {isLoading && (
        <LoadingOverlay>
          <CircularProgress />
        </LoadingOverlay>
      )}
      
      <ToolbarContainer>
        <div ref={toolbarRef} className="custom-toolbar">
          <ToolbarSection>
            <span className="ql-formats">
              <select className="ql-header">
                <option value="1">見出し 1</option>
                <option value="2">見出し 2</option>
                <option value="3">見出し 3</option>
                <option value="">標準テキスト</option>
              </select>
            </span>
            
            <ToolbarDivider orientation="vertical" flexItem />
            
            <span className="ql-formats">
              <button className="ql-bold" title="太字" />
              <button className="ql-italic" title="斜体" />
              <button className="ql-underline" title="下線" />
              <button className="ql-strike" title="取り消し線" />
            </span>
            
            <ToolbarDivider orientation="vertical" flexItem />
            
            <span className="ql-formats">
              <select className="ql-color" title="文字色">
                <option value="rgb(0, 0, 0)" />
                <option value="rgb(230, 0, 0)" />
                <option value="rgb(255, 153, 0)" />
                <option value="rgb(255, 255, 0)" />
                <option value="rgb(0, 138, 0)" />
                <option value="rgb(0, 102, 204)" />
                <option value="rgb(153, 51, 255)" />
                <option value="rgb(255, 255, 255)" />
                <option value="rgb(250, 204, 204)" />
                <option value="rgb(255, 235, 204)" />
                <option value="rgb(255, 255, 204)" />
                <option value="rgb(204, 232, 204)" />
                <option value="rgb(204, 224, 245)" />
                <option value="rgb(235, 214, 255)" />
                <option value="rgb(187, 187, 187)" />
                <option value="rgb(240, 102, 102)" />
                <option value="rgb(255, 194, 102)" />
                <option value="rgb(255, 255, 102)" />
                <option value="rgb(102, 185, 102)" />
                <option value="rgb(102, 163, 224)" />
                <option value="rgb(194, 133, 255)" />
                <option value="rgb(136, 136, 136)" />
                <option value="rgb(161, 0, 0)" />
                <option value="rgb(178, 107, 0)" />
                <option value="rgb(178, 178, 0)" />
                <option value="rgb(0, 97, 0)" />
                <option value="rgb(0, 71, 178)" />
                <option value="rgb(107, 36, 178)" />
                <option value="rgb(68, 68, 68)" />
                <option value="rgb(92, 0, 0)" />
                <option value="rgb(102, 61, 0)" />
                <option value="rgb(102, 102, 0)" />
                <option value="rgb(0, 55, 0)" />
                <option value="rgb(0, 41, 102)" />
                <option value="rgb(61, 20, 102)" />
              </select>
              <select className="ql-background" title="背景色">
                <option value="rgb(0, 0, 0)" />
                <option value="rgb(230, 0, 0)" />
                <option value="rgb(255, 153, 0)" />
                <option value="rgb(255, 255, 0)" />
                <option value="rgb(0, 138, 0)" />
                <option value="rgb(0, 102, 204)" />
                <option value="rgb(153, 51, 255)" />
                <option value="rgb(255, 255, 255)" />
                <option value="rgb(250, 204, 204)" />
                <option value="rgb(255, 235, 204)" />
                <option value="rgb(255, 255, 204)" />
                <option value="rgb(204, 232, 204)" />
                <option value="rgb(204, 224, 245)" />
                <option value="rgb(235, 214, 255)" />
                <option value="rgb(187, 187, 187)" />
                <option value="rgb(240, 102, 102)" />
                <option value="rgb(255, 194, 102)" />
                <option value="rgb(255, 255, 102)" />
                <option value="rgb(102, 185, 102)" />
                <option value="rgb(102, 163, 224)" />
                <option value="rgb(194, 133, 255)" />
                <option value="rgb(136, 136, 136)" />
                <option value="rgb(161, 0, 0)" />
                <option value="rgb(178, 107, 0)" />
                <option value="rgb(178, 178, 0)" />
                <option value="rgb(0, 97, 0)" />
                <option value="rgb(0, 71, 178)" />
                <option value="rgb(107, 36, 178)" />
                <option value="rgb(68, 68, 68)" />
                <option value="rgb(92, 0, 0)" />
                <option value="rgb(102, 61, 0)" />
                <option value="rgb(102, 102, 0)" />
                <option value="rgb(0, 55, 0)" />
                <option value="rgb(0, 41, 102)" />
                <option value="rgb(61, 20, 102)" />
              </select>
            </span>
            
            <ToolbarDivider orientation="vertical" flexItem />
            
            <span className="ql-formats">
              <select className="ql-align" title="テキスト揃え">
                <option selected></option>
                <option value="center"></option>
                <option value="right"></option>
                <option value="justify"></option>
              </select>
            </span>
            
            <span className="ql-formats">
              <button className="ql-list" value="ordered" title="番号付きリスト" />
              <button className="ql-list" value="bullet" title="箇条書き" />
              <button className="ql-indent" value="-1" title="インデント減らす" />
              <button className="ql-indent" value="+1" title="インデント増やす" />
            </span>
            
            <ToolbarDivider orientation="vertical" flexItem />
            
            <span className="ql-formats">
              <button className="ql-link" title="リンク" />
              <button className="ql-image" title="画像" />
              <button className="ql-table" title="テーブル" />
            </span>
            
            <ToolbarDivider orientation="vertical" flexItem />
            
            {/* 改ページボタン */}
            <span className="ql-formats">
              <PageBreakButton 
                onClick={insertPageBreak}
                title="改ページを挿入"
              >
                改ページ
              </PageBreakButton>
            </span>
            
            
            <ToolbarDivider orientation="vertical" flexItem />
            
            <span className="ql-formats">
              <button className="ql-clean" title="書式をクリア" />
            </span>
          </ToolbarSection>
        </div>
      </ToolbarContainer>
      
      <EditorContent>
        <div ref={editorRef} />
      </EditorContent>
    </EditorContainer>
  );
};

export default CustomEditor;