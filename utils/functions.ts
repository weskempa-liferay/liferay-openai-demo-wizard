const getAvailableLanguages = () => {
  return [
    { id: 'en-US', name: 'English (United States)' },
    { id: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
    { id: 'ca-ES', name: 'Catalan (Spain)' },
    { id: 'zh-CN', name: 'Chinese (China)' },
    { id: 'nl-NL', name: 'Dutch (Netherlands)' },
    { id: 'fi-FI', name: 'Finnish (Finland)' },
    { id: 'fr-FR', name: 'French (France)' },
    { id: 'de-DE', name: 'German (Germany)' },
    { id: 'hu-HU', name: 'Hungarian (Hungary)' },
    { id: 'ja-JP', name: 'Japanese (Japan)' },
    { id: 'pt-BR', name: 'Portuguese (Brazil)' },
    { id: 'es-ES', name: 'Spanish (Spain)' },
    { id: 'sv-SE', name: 'Swedish (Sweden)' },
  ];
};

const functions = {
  getAIModelOptions: () => {
    return [
      { id: 'gpt-3.5-turbo', name: 'GPT 3.5 Turbo' },
      { id: 'gpt-3.5-turbo-1106', name: 'GPT 3.5 Turbo (u1106) - Default' },
      { id: 'gpt-4', name: 'GPT 4.0' },
      { id: 'gpt-4-turbo-preview', name: 'GPT 4.0 Turbo Preview (u0125)' }
    ];
  },
  getAPIOptions: (method, defaultLanguage, base64data) => {
    return {
      headers: {
        Accept: 'application/json',
        Authorization: 'Basic ' + base64data,
        'Content-Type': 'application/json',
        ...(defaultLanguage && { 'Accept-Language': defaultLanguage }),
      },
      method: method
    };
  },
  getAvailableLanguages,
  getD2ImageSizeOptions: () => {
    return [
      { cost: 0.02, id: '1024x1024-standard', name: '1024x1024' },
      { cost: 0.018, id: '512x512-standard', name: '512x512' },
      { cost: 0.016, id: '256x256-standard', name: '256x256' }
    ];
  },
  getD3ImageSizeOptions: () => {
    return [
      { cost: 0.04, id: '1024x1024-standard', name: '1024x1024' },
      { cost: 0.08, id: '1024x1792-standard', name: '1024x1792' },
      { cost: 0.08, id: '1792x1024-standard', name: '1792x1024' },
      { cost: 0.08, id: '1024x1024-hd', name: '1024x1024 HD' },
      { cost: 0.12, id: '1024x1792-hd', name: '1024x1792 HD' },
      { cost: 0.12, id: '1792x1024-hd', name: '1792x1024 HD' }
    ];
  },
  getDefaultAIModel: () => {
    return "gpt-3.5-turbo-1106";
  },
  getFilePostOptions: (apiPath, fileStream, fileKey, base64data) => {
      let options = {
        formData: {},
        headers: {
          Authorization: 'Basic ' + base64data,
          'Content-Type': 'multipart/form-data',
        },
        method: 'POST',
        url: apiPath,
      };
    
    options.formData[fileKey] = fileStream;
    return options;
  },
  getLanguageDisplayName: (value) => {
    let languages = getAvailableLanguages();

    for (let i = 0; i < languages.length; i++) {
      if (languages[i].id == value) return languages[i].name;
    }

    return languages[0].name;
  },
  getViewOptions: () => {
    return [
      { id: 'Anyone', name: 'Anyone' },
      { id: 'Members', name: 'Members' },
      { id: 'Owner', name: 'Owner' }
    ];
  },
  millisToMinutesAndSeconds: (millis) => {
    const date = new Date(millis);
    if (date.getMinutes()) {
      return `${date.getMinutes()} minutes, ${date.getSeconds()} seconds`;
    } else {
      return `${date.getSeconds()} seconds`;
    }
  },
  returnArraySet: (value) => {
    if (value.indexOf(',') > -1) {
      return value.split(',');
    } else if (parseInt(value) > 0) {
      return [value];
    } else {
      return [];
    }
  },
};

export default functions;
