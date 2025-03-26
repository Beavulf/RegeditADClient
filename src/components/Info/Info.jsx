import React from "react";
const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT
function PdfViewer({ fileUrl }) {
  return (
    <iframe
      src={fileUrl}
      width="100%"
      style={{ border: "none", display:'flex', flex:'1', height: '800px' }}
    />
  );
}

export default function App() {
    const urlFile = `http://${SERVER_ADDRESS}:${SERVER_PORT}/static/info/AppInfo.pdf`
  return <PdfViewer fileUrl={urlFile}/>;
}
