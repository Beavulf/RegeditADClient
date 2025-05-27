import React, { useState, useEffect, useRef } from "react";
const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT

function FileViewer({ fileUrl }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(text => {
        const basePath = fileUrl.substring(0, fileUrl.lastIndexOf('/'));
        const processedContent = text.replace(
          /(src|href)="([^"]+)"/g,
          (match, attr, path) => {
            if (path.startsWith('http') || path.startsWith('data:')) return match;
            return `${attr}="${basePath}/${path}"`;
          }
        );
        setContent(processedContent);
      })
      .catch(error => {
        setError('Ошибка загрузки контента');
      });
  }, [fileUrl]);

  // Навешиваем обработчик на все картинки после рендера контента
  useEffect(() => {
    if (contentRef.current) {
      const imgs = contentRef.current.querySelectorAll('img');
      imgs.forEach(img => {
        img.style.cursor = 'pointer';
        img.onclick = (e) => {
          window.open(img.src, '_blank');
        };
      });
    }
  }, [content]);

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div
      ref={contentRef}
      style={{
        border: "none",
        display: 'flex',
        flex: '1',
        height: '800px',
        overflow: 'auto',
        padding: '20px',
        background: '#fff',
        color:'black'
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default function Updates() {
  const urlFile = `http://${SERVER_ADDRESS}:${SERVER_PORT}/static/info/UpdatesSS.htm`
  return <FileViewer fileUrl={urlFile}/>;
}
