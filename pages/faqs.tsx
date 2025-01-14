import hljs from "highlight.js";
import { useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";

import TopNavItem from "../components/apptopnavitem";
import FieldLanguage from "../components/formfield-language";
import FieldSubmit from "../components/formfield-submit";
import Form from "../components/forms/form";
import Input from "../components/forms/input";
import Select from "../components/forms/select";
import Layout from "../components/layout";
import LoadingAnimation from "../components/loadinganimation";
import ResultDisplay from "../components/resultdisplay";
import schema, { z, zodResolver } from "../schemas/zod";
import nextAxios from "../services/next";
import { downloadFile } from "../utils/download";
import functions from "../utils/functions";
import { logger } from "../utils/logger";

const debug = logger("faqs");

type FaqSchema = z.infer<typeof schema.faq>;

const handleStructureClick = () => {
  downloadFile({
    fileName: "Structure-Frequently_Asked_Question.json",
    filePath: "faqs/Structure-Frequently_Asked_Question.json",
  });
};

const handleFragmentClick = () => {
  location.href = "faqs/Fragment-FAQ.zip";
};

const viewOptions = functions.getViewOptions();

export default function Faqs() {

  const faqForm = useForm<FaqSchema>({
    defaultValues: {
      defaultLanguage: "en-US",
      faqNumber: "5",
      folderId: "0",
      languages: [""],
      manageLanguage: false,
      categoryIds: "",
      viewOptions: viewOptions[0].id,
    },
    resolver: zodResolver(schema.faq),
  });

  const [result, setResult] = useState("");

  async function onSubmit(payload: FaqSchema) {
    debug(
      `languagesInput ${payload.languages}, manageLanguageInput ${payload.manageLanguage}, defaultLaguagesInput ${payload.defaultLanguage}`,
    );

    const { data } = await nextAxios.post("/api/faqs", payload);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);
  }

  const {
    formState: { isSubmitting },
  } = faqForm;

  return (
    <Layout
      description={`Type your topic in the field below and wait for your FAQs. Examples of FAQ topics are "budget planning", "starting a manufacturing company", or "practical uses of sodium bicarbonate".`}
      title="Liferay FAQ Generator"
    >
      <div className="download-options fixed right-5 top-2 rounded p-5 text-lg">
        <TopNavItem label="FAQ Structure" onClick={handleStructureClick} />
        <TopNavItem label="FAQ Fragment" onClick={handleFragmentClick} />
      </div>

      <Form
        formProviderProps={faqForm}
        onSubmit={faqForm.handleSubmit(onSubmit)}
      >
        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-4">
          <Input
            label="FAQ Topic"
            name="faqTopic"
            placeholder="Enter a FAQ Topic"
          />

          <Input
            label="Number of Q&A Pairs to Create"
            name="faqNumber"
            placeholder="Number of FAQs"
          />

          <Input
            label="Site ID or Asset Library Group ID"
            name="siteId"
            placeholder="Enter a site ID or asset library group ID"
          />

          <Input
            label="FAQ Structure ID"
            name="structureId"
            placeholder="Enter the FAQ structure ID"
          />

          <Input
            label="Web Content Folder ID (0 for Root)"
            name="folderId"
            placeholder="Enter a folder ID"
          />

          <Select
            label="View Options"
            name="viewOptions"
            optionMap={viewOptions}
          />

          <Input
            label="Comma-Delimited Category IDs (Optional)"
            name="categoryIds"
            placeholder="List of comma-delimited category IDs"
          />
        </div>

        <FieldLanguage
          defaultLanguageChange={(value) =>
            faqForm.setValue("defaultLanguage", value)
          }
          languagesChange={(value) => faqForm.setValue("languages", value)}
          manageLanguageChange={(value) =>
            faqForm.setValue("manageLanguage", value)
          }
        />

        <FieldSubmit 
          disabled={!faqForm.formState.isValid || isSubmitting}
          label="Generate FAQs" />
      </Form>

      <p className="mb-3 w-1/2 rounded bg-white/10 p-5 text-center text-lg italic text-slate-100">
        <b>Note:</b> FAQ generation requires a specific content structure.{" "}
        <br />
        Please use the supplied FAQ Structure and Fragment supplied above.
      </p>

      {isSubmitting ? (
        <LoadingAnimation />
      ) : (
        result && <ResultDisplay result={result} />
      )}
    </Layout>
  );
}
