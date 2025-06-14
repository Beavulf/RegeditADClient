const SERVER_ADDRESS = import.meta.env.VITE_SERVER_ADDRESS
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT
const SPRAV_MRT = import.meta.env.VITE_SPRAV_MRT

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
  // const urlFile = encodeURI(SPRAV_MRT)
  const urlFile = `http://${SERVER_ADDRESS}:${SERVER_PORT}/static/info/AppInfo.pdf`
  return <PdfViewer fileUrl={urlFile}/>;
}
