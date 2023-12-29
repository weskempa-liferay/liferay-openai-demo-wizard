import { useState } from 'react';

import functions from '../utils/functions';
import FieldSelect from './formfield-select';
import FieldToggle from './formfield-toggle';

export default function FieldLanguage({
  debug,
  defaultLanguageChange,
  languagesChange,
  manageLanguageChange,
}) {
  const [manageLanguage, setManageLanguage] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('en-US');
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const languageOptions = functions.getAvailableLanguages();

  const handleManageLanguageChange = (value) => {
    setManageLanguage(!manageLanguage);
    manageLanguageChange(!manageLanguage);
  };

  const handleDefaultLanguageChange = (select) => {
    if (debug) console.log('value:', select);

    setSelectedLanguages(addRemoveLangauges(select, false));
    setDefaultLanguage(select);
    defaultLanguageChange(select);
    languagesChange(selectedLanguages);
  };

  const handleInputChange = (toggle) => {
    if (debug) console.log('value:', toggle);
    setSelectedLanguages(addRemoveLangauges(toggle.fieldKey, toggle.value));
    if (debug) console.log(selectedLanguages);
    languagesChange(selectedLanguages);
  };

  const addRemoveLangauges = (fieldKey, value) => {
    let languages = selectedLanguages;
    if (debug) console.log(fieldKey);

    for (let i = 0; i < languages.length; i++) {
      if (value && languages[i] == fieldKey) {
        if (debug) console.log('Key Exists - No Change');
        return languages;
      } else if (!value && languages[i] == fieldKey) {
        if (debug) console.log('Key Found and Removed');
        languages.splice(i, 1);
        if (debug) console.log(languages);
        return languages;
      }
    }

    if (value) languages.push(fieldKey);

    if (debug) console.log(languages);
    return languages;
  };

  return (
    <div className="py-2 px-2 mb-5 bg-white/10">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:gap-2 items-start">
        <FieldToggle
          defaultValue={false}
          fieldKey={'manageLanguage'}
          inputChange={handleManageLanguageChange}
          name={'Manage Languages'}
        />

        {manageLanguage && (
          <>
            <FieldSelect
              inputChange={handleDefaultLanguageChange}
              label={'Site Default Language'}
              name={'defaultLanguage'}
              optionMap={languageOptions}
            />

            <div className="flex flex-col italic inline-flex items-center w-300">
              <p className="text-slate-100 text-center text-md m-4 p-2 italic rounded bg-white/10 ">
                Site default language needs to match the chosen site (Site ID).
              </p>
            </div>
          </>
        )}
      </div>
      {manageLanguage && (
        <>
          <h1 className="text-white pl-4 font-extrabold">Add Translations</h1>
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-4 md:gap-1 mb-2">
            {languageOptions
              .filter(function (option) {
                return option.id != defaultLanguage;
              })
              .map((option) => {
                return (
                  <FieldToggle
                    defaultValue={false}
                    fieldKey={option.id}
                    inputChange={handleInputChange}
                    key={option.id}
                    name={option.name}
                  />
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
