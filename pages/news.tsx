import hljs from 'highlight.js';
import { useEffect, useState } from 'react';

import AppFooter from './components/appfooter';
import AppHead from './components/apphead';
import AppHeader from './components/appheader';
import TopNavItem from './components/apptopnavitem';
import FieldImageType from './components/formfield-imagetype';
import FieldLanguage from './components/formfield-language';
import FieldString from './components/formfield-string';
import FieldSubmit from './components/formfield-submit';
import FieldSelect from './components/formfield-select';
import ImageStyle from './components/imagestyle';
import LoadingAnimation from './components/loadinganimation';
import ResultDisplay from './components/resultdisplay';
import functions from './utils/functions';

export default function News() {
  const [categoryIdsInput, setCategoryIdsInput] = useState('');
  const [defaultLanguageInput, setDefaultLanguage] = useState('en-US');
  const [folderIdInput, setFolderIdInput] = useState('');
  const [imageFolderIdInput, setImageFolderIdInput] = useState('0');
  const [imageGenerationType, setImageGenerationType] = useState('none');
  const [imageStyleInput, setImageStyleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [languagesInput, setLanguages] = useState([]);
  const [viewOptionsInput, setViewOptionsSelect] = useState('Anyone');
  const viewOptions = functions.getViewOptions();
  const [manageLanguageInput, setManageLanguage] = useState(false);
  const [newsLengthInput, setNewsLengthInput] = useState('75');
  const [newsNumberInput, setNewsNumberInput] = useState('3');
  const [newsTopicInput, setNewsTopicInput] = useState('');
  const [result, setResult] = useState(() => '');
  const [showImageFolder, showImageFolderInput] = useState(false);
  const [showStyleInput, setShowImageStyleInput] = useState(false);
  const [siteIdInput, setSiteIdInput] = useState('');
  const [structureIdInput, setStructureIdInput] = useState('');
  const [submitLabel, setSubmitLabel] = useState('');

  const onImageStyleInputChange = (value) => {
    setImageStyleInput(value);
  };

  let USDollar = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  });

  useEffect(() => {
    updateCost();
  }, [newsNumberInput, imageGenerationType]);

  const updateCost = () => {
    setShowImageStyleInput(false);
    let cost = '';

    showImageFolderInput(false);
    if (isNaN(parseInt(newsNumberInput))) {
      cost = '$0.00';
    } else if (imageGenerationType == 'dall-e-3') {
      setShowImageStyleInput(true);
      cost = USDollar.format(parseInt(newsNumberInput) * 0.04);
      showImageFolderInput(true);
    } else if (imageGenerationType == 'dall-e-2') {
      cost = USDollar.format(parseInt(newsNumberInput) * 0.02);
      showImageFolderInput(true);
    } else {
      cost = '<$0.01';
    }

    setSubmitLabel('Generate News - Estimated cost: ' + cost);
  };

  const handleStructureClick = () => {
    downloadFile({
      fileName: 'Structure-News_Article',
      filePath: 'news/Structure-News_Article.json',
    });
  };

  const downloadFile = ({ fileName, filePath }) => {
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

  const handleFragmentClick = () => {
    location.href = 'news/Fragment-News.zip';
  };

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch('/api/news', {
      body: JSON.stringify({
        categoryIds: categoryIdsInput,
        defaultLanguage: defaultLanguageInput,
        folderId: folderIdInput,
        imageFolderId: imageFolderIdInput,
        imageGeneration: imageGenerationType,
        imageStyle: imageStyleInput,
        languages: languagesInput,
        viewOptions: viewOptionsInput,
        manageLanguage: manageLanguageInput,
        newsLength: newsLengthInput,
        newsNumber: newsNumberInput,
        newsTopic: newsTopicInput,
        siteId: siteIdInput,
        structureId: structureIdInput,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const data = await response.json();

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setIsLoading(false);
  }

  return (
    <div>
      <AppHead title="News Generator" />

      <main className="py-20 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        <AppHeader
          desc={
            'Type your topic in the field below and wait for your News. Examples of news topics are "technological advancements in healthcare", "new years resolutions", or "successful leadership approaches and goals".'
          }
          title='Liferay News Generator'
        />

        <div className="fixed top-2 right-5 text-lg download-options p-5 rounded">
          <TopNavItem label="News Structure" onClick={handleStructureClick} />

          <TopNavItem label="News Fragment" onClick={handleFragmentClick} />
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
            <FieldString
              defaultValue=""
              inputChange={setNewsTopicInput}
              label="News Topic"
              name="topic"
              placeholder="Enter a News topic"
            />

            <FieldString
              defaultValue="3"
              inputChange={setNewsNumberInput}
              label="Number of Articles to Create (Max 10)"
              name="newsNumber"
              placeholder="Number of News posts"
            />

            <FieldString
              defaultValue="75"
              inputChange={setNewsLengthInput}
              label="Expected News Post Length (in # of words)"
              name="newsLength"
              placeholder="Expected News Post Length"
            />

            <FieldString
              defaultValue=""
              inputChange={setSiteIdInput}
              label="Site ID or Asset Library Group ID"
              name="siteId"
              placeholder="Enter a site ID or asset library group ID"
            />

            <FieldString
              defaultValue="0"
              inputChange={setFolderIdInput}
              label="Web Content Folder ID (0 for Root)"
              name="webContentFolderId"
              placeholder="Enter a Web Content Folder ID"
            />

            <FieldString
              defaultValue=""
              inputChange={setStructureIdInput}
              label="Structure ID"
              name="structureId"
              placeholder="Enter a Structure ID"
            />

            <FieldString
              defaultValue=""
              inputChange={setCategoryIdsInput}
              label="Comma-Delimited Category IDs (Optional)"
              name="categoryIds"
              placeholder="List of Comma-Delimited Category IDs"
            />

            <FieldSelect
              inputChange={setViewOptionsSelect}
              label="View Options"
              name="viewOption"
              optionMap={viewOptions}
            />

            <FieldImageType
              includeNone={true}
              inputChange={setImageGenerationType}
            />

            {showImageFolder && (
              <FieldString
                defaultValue="0"
                inputChange={setImageFolderIdInput}
                label="Image Folder ID (0 for Doc Lib Root)"
                name="imageFolderId"
                placeholder="Enter a Document Library Folder ID"
              />
            )}

            {showStyleInput && (
              <ImageStyle styleInputChange={onImageStyleInputChange} />
            )}
          </div>

          <FieldLanguage
            defaultLanguageChange={setDefaultLanguage}
            languagesChange={setLanguages}
            manageLanguageChange={setManageLanguage}
          />

          <FieldSubmit disabled={isLoading} label={submitLabel} />
        </form>

        <p className="text-slate-100 text-center text-lg mb-3 rounded p-5 bg-white/10 italic">
          <b>Note:</b> News Article generation requires a specific content
          structure. <br />
          Please use the supplied News Structure supplied above.
        </p>

        {isLoading ? (
          <LoadingAnimation />
        ) : (
          result && <ResultDisplay result={result} />
        )}
      </main>

      <AppFooter />
    </div>
  );
}
