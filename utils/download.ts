import axios from 'axios';

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

export async function getDownloadFormData(url: string) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  const blob = new Blob([response.data]);
  const file = new File([blob], `openai-wizard-${new Date().getTime()}.jpg`);

  const formData = new FormData();

  formData.append('file', file);

  return formData;
}
