import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import mammoth from "mammoth";

const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT
const SPRAV_MRT = import.meta.env.VITE_SPRAV_MRT

function DocViewer({ fileUrl }) {
  const [content, setContent] = useState(null);
  const ext = fileUrl.split('.').pop().toLowerCase();

  useEffect(() => {
    if (ext === 'docx' || ext === 'doc') {
      setContent('Загрузка...');
      fetch(fileUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
        .then(result => setContent(result.value))
        .catch(() => setContent('Ошибка загрузки документа'));
    }
  }, [fileUrl, ext]);

  if (ext === 'pdf') {
    return (
      <iframe
        src={fileUrl}
        // width="100%"
        style={{ border: "none", display: 'flex', flex: '1', height: '100%' }}
        title="PDF Viewer"
      />
    );
  }

  if (ext === 'docx' || ext === 'doc') {
    return (
      <div
        style={{
          backgroundColor: 'white',
          color: 'black',
          width: "80vw",
          // maxWidth: 900,
          minHeight: 800,
          border: "1px solid #ccc",
          padding: 16,
          overflow: "auto",
          textAlign: "justify",
          wordBreak: "break-word",
          margin: "0 auto",
        }}
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    );
  }

  return <div>Неподдерживаемый формат файла</div>;
}

DocViewer.propTypes = {
  fileUrl: PropTypes.string.isRequired,
};

export default function App() {
  const urlFile = `file:///\\\\10.6.100.13\\otdel_mrt\\_PUBLIC\\Passport_mrt\\Телефонный справочник\\Телефонный справочник МРТ_Actual.docx`
  // const urlFile = `http://${SERVER_ADDRESS}:${SERVER_PORT}/static/info/UpdatesSS.docx`
  return <DocViewer fileUrl={urlFile}/>;
}
