const getAvailableLanguages = () => {
  return [
    { id: 'en-US', name: 'English (United States)' },
    { id: 'ar-SA', name: 'العربية (المملكة العربية السعودية)' },
    { id: 'ca-ES', name: 'català (Espanya)' },
    { id: 'zh-CN', name: '中文 (中国)' },
    { id: 'nl-NL', name: 'Nederlands (Nederland)' },
    { id: 'fi-FI', name: 'suomi (Suomi)' },
    { id: 'fr-FR', name: 'français (France)' },
    { id: 'de-DE', name: 'Deutsch (Deutschland)' },
    { id: 'hu-HU', name: 'magyar (Magyarország)' },
    { id: 'ja-JP', name: '日本語 (日本)' },
    { id: 'pt-BR', name: 'português (Brasil)' },
    { id: 'es-ES', name: 'español (España)' },
    { id: 'sv-SE', name: 'svenska (Sverige)' },
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
      method: method,
      port: 8080,
    };
  },
  getAvailableLanguages,
  getBase64data,
  getFilePostOptions: (apiPath, fileStream) => {
    return {
      formData: {
        file: fileStream,
      },
      headers: {
        Authorization: 'Basic ' + getBase64data(),
        'Content-Type': 'multipart/form-data',
      },
      method: 'POST',
      url: apiPath,
    };
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
