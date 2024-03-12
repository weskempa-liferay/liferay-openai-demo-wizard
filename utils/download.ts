export const downloadFile = ({ fileName, filePath }) => {
  const a = document.createElement('a');
  a.download = fileName;
  a.href = filePath;
  const clickEvt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
};
