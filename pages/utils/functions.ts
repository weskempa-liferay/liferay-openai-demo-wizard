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

const getBase64data = () => {
  const usernamePasswordBuffer = Buffer.from(
    process.env.LIFERAY_ADMIN_EMAIL_ADDRESS +
      ':' +
      process.env.LIFERAY_ADMIN_PASSWORD
  );

  return usernamePasswordBuffer.toString('base64');
};

const functions = {
  getAPIOptions: (method, defaultLanguage) => {
    return {
      headers: {
        Accept: 'application/json',
        Authorization: 'Basic ' + getBase64data(),
        'Content-Type': 'application/json',
        ...(defaultLanguage && { 'Accept-Language': defaultLanguage }),
      },
      method: method
    };
  },
  getViewOptions: () => {
    return [
      { id: 'Anyone', name: 'Anyone' },
      { id: 'Members', name: 'Members' },
      { id: 'Owner', name: 'Owner' }
    ];
  },
  getAIModelOptions: () => {
    return [
      { id: 'gpt-3.5-turbo', name: 'GPT 3.5 Turbo' },
      { id: 'gpt-3.5-turbo-1106', name: 'GPT 3.5 Turbo (u1106) - Default' },
      { id: 'gpt-4', name: 'GPT 4.0' },
      { id: 'gpt-4-turbo-preview', name: 'GPT 4.0 Turbo Preview (u0125)' }
    ];
  },
  getDefaultAIModel: () => {
    return "gpt-3.5-turbo-1106";
  },
  getD2ImageSizeOptions: () => {
    return [
      { name: '1024x1024', id: '1024x1024-standard', cost: 0.02 },
      { name: '512x512', id: '512x512-standard', cost: 0.018 },
      { name: '256x256', id: '256x256-standard', cost: 0.016 }
    ];
  },
  getD3ImageSizeOptions: () => {
    return [
      { name: '1024x1024', id: '1024x1024-standard', cost: 0.04 },
      { name: '1024x1792', id: '1024x1792-standard', cost: 0.08 },
      { name: '1792x1024', id: '1792x1024-standard', cost: 0.08 },
      { name: '1024x1024 HD', id: '1024x1024-hd', cost: 0.08 },
      { name: '1024x1792 HD', id: '1024x1792-hd', cost: 0.12 },
      { name: '1792x1024 HD', id: '1792x1024-hd', cost: 0.12 }
    ];
  },
  getAvailableLanguages,
  getBase64data,
  getFilePostOptions: (apiPath, fileStream, fileKey) => {
    let options = {
        formData: {},
        headers: {
          Authorization: 'Basic ' + getBase64data(),
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
