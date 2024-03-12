import hljs from 'highlight.js';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import TopNavItem from '../components/apptopnavitem';
import FieldLanguage from '../components/formfield-language';
import FieldSubmit from '../components/formfield-submit';
import Form from '../components/forms/form';
import Input from '../components/forms/input';
import Select from '../components/forms/select';
import ImageStyle from '../components/imagestyle';
import Layout from '../components/layout';
import LoadingAnimation from '../components/loadinganimation';
import ResultDisplay from '../components/resultdisplay';
import schema, { z, zodResolver } from '../schemas/zod';
import nextAxios from '../services/next';
import { USDollar } from '../utils/currency';
import { downloadFile } from '../utils/download';
import functions from '../utils/functions';

type NewsSchema = z.infer<typeof schema.news>;

const viewOptions = functions.getViewOptions();

const handleStructureClick = () => {
  downloadFile({
    fileName: 'Structure-News_Article',
    filePath: 'news/Structure-News_Article.json',
  });
};

const handleFragmentClick = () => {
  location.href = 'news/Fragment-News.zip';
};

export default function News() {
  const newsForm = useForm<NewsSchema>({
    defaultValues: {
      defaultLanguage: 'en-US',
      imageFolderId: '0',
      imageGeneration: 'none',
      imageStyle: '',
      languages: [],
      manageLanguage: false,
      newsLength: '75',
      newsNumber: '3',
      viewOptions: 'Anyone',
    },
    resolver: zodResolver(schema.news),
  });

  const [result, setResult] = useState('');

  const {
    formState: { isSubmitting },
    watch,
  } = newsForm;

  const imageGeneration = watch('imageGeneration');
  const newsNumber = watch('newsNumber');

  const { showImageFolder, showImageStyle, submitLabel } = useMemo(() => {
    let cost = '';
    let showImageStyle = false;
    let showImageFolder = false;

    if (isNaN(parseInt(newsNumber))) {
      cost = '$0.00';
    } else if (imageGeneration == 'dall-e-3') {
      showImageStyle = true;
      showImageFolder = true;
      cost = USDollar.format(parseInt(newsNumber) * 0.04);
    } else if (imageGeneration == 'dall-e-2') {
      cost = USDollar.format(parseInt(newsNumber) * 0.02);
      showImageFolder = true;
    } else {
      cost = '<$0.01';
    }

    return {
      showImageFolder,
      showImageStyle,
      submitLabel: 'Generate News - Estimated cost: ' + cost,
    };
  }, [newsNumber, imageGeneration]);

  async function onSubmit(payload: NewsSchema) {
    const { data } = await nextAxios.post('/api/news', payload);

    const hljsResult = hljs.highlightAuto(data.result).value;

    setResult(hljsResult);
  }

  return (
    <Layout
      description='Type your topic in the field below and wait for your News. Examples of news topics are "technological advancements in healthcare", "new years resolutions", or "successful leadership approaches and goals".'
      title="Liferay News Generator"
    >
      <div className="fixed top-2 right-5 text-lg download-options p-5 rounded">
        <TopNavItem label="News Structure" onClick={handleStructureClick} />

        <TopNavItem label="News Fragment" onClick={handleFragmentClick} />
      </div>

      <Form
        formProviderProps={newsForm}
        onSubmit={newsForm.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4 mb-5">
          <Input
            label="News Topic"
            name="newsTopic"
            placeholder="Enter a News topic"
          />

          <Input
            label="Number of Articles to Create (Max 10)"
            name="newsNumber"
            placeholder="Number of News posts"
          />

          <Input
            label="Expected News Post Length (in # of words)"
            name="newsLength"
            placeholder="Expected News Post Length"
          />

          <Input
            label="Site ID or Asset Library Group ID"
            name="siteId"
            placeholder="Enter a site ID or asset library group ID"
          />

          <Input
            label="Web Content Folder ID (0 for Root)"
            name="folderId"
            placeholder="Enter a Web Content Folder ID"
          />

          <Input
            label="Structure ID"
            name="structureId"
            placeholder="Enter a Structure ID"
          />

          <Input
            label="Comma-Delimited Category IDs (Optional)"
            name="categoryIds"
            placeholder="List of Comma-Delimited Category IDs"
          />

          <Select
            label="View Options"
            name="viewOptions"
            optionMap={viewOptions}
          />

          <Select
            label="Image Generation"
            name="imageGeneration"
            optionMap={[
              { id: 'none', name: 'None' },
              { id: 'dall-e-3', name: 'DALL·E 3 (Highest-Quality Images)' },
              { id: 'dall-e-2', name: 'DALL·E 2 (Basic Images)' },
            ]}
          />

          {showImageFolder && (
            <Input
              label="Image Folder ID (0 for Doc Lib Root)"
              name="imageFolderId"
              placeholder="Enter a Document Library Folder ID"
            />
          )}

          {showImageStyle && (
            <ImageStyle
              styleInputChange={(value) =>
                newsForm.setValue('imageStyle', value)
              }
            />
          )}
        </div>

        <FieldLanguage
          defaultLanguageChange={(value) =>
            newsForm.setValue('defaultLanguage', value)
          }
          languagesChange={(value) => newsForm.setValue('languages', value)}
          manageLanguageChange={(value) =>
            newsForm.setValue('manageLanguage', value)
          }
        />

        <FieldSubmit disabled={isSubmitting} label={submitLabel} />
      </Form>

      <p className="text-slate-100 text-center text-lg mb-3 rounded p-5 bg-white/10 w-1/2 italic">
        <b>Note:</b> News Article generation requires a specific content
        structure. <br />
        Please use the supplied News Structure supplied above.
      </p>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
