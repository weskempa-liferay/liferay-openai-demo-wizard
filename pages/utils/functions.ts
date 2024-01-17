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
