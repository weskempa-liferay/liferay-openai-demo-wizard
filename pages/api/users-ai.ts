import axios from 'axios';
import fs from 'fs';
import OpenAI from 'openai';
import request from 'request';

import functions from '../utils/functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function Action(req, res) {
  let start = new Date().getTime();
  let successCount = 0;
  let errorCount = 0;

  const debug = req.body.debugMode;

  const userSchema = {
    properties: {
      users: {
        description:
          'An array of ' +
          req.body.userNumber +
          ' example users that will be added to the portal for demonstration',
        items: {
          properties: {
            birthDate: {
              description:
                "The user's birthday. It needs to be supplied in the format YYYY-MM-DD",
              type: 'string',
            },
            familyName: {
              description:
                "The user's last name. Do not use the name Smith or Doe.",
              type: 'string',
            },
            gender: {
              description: "This is the user's gender.",
              enum: ['male', 'female'],
              type: 'string',
            },
            givenName: {
              description:
                "The user's first name. Do not use the names Jane or John.",
              type: 'string',
            },
            jobTitle: {
              description: "The user's job title.",
              type: 'string',
            },
          },
          required: [
            'birthDate',
            'familyName',
            'givenName',
            'gender',
            'jobTitle',
          ],
          type: 'object',
        },
        required: ['users'],
        type: 'array',
      },
    },
    type: 'object',
  };

  const response = await openai.chat.completions.create({
    functions: [{ name: 'get_users', parameters: userSchema }],
    messages: [
      {
        content:
          'You are a system administrator responsible for adding users to a portal.',
        role: 'system',
      },
      {
        content:
          'Create a list of example users to be added to the portal for demonstration. Do not use the first or last names John, Jane, Smith, or Doe. Return only the result of the get_users function.',
        role: 'user',
      },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
  });

  let userlist = JSON.parse(
    response.choices[0].message.function_call.arguments
  ).users;
  let genderCount = {
    female: 0,
    male: 0,
  };

  for (let i = 0; i < userlist.length; i++) {
    console.log(userlist[i].gender);

    let gender = userlist[i].gender;
    genderCount[gender] = genderCount[gender] + 1;
    delete userlist[i].gender;

    userlist[i].alternateName =
      userlist[i].givenName + '.' + userlist[i].familyName;
    userlist[i].emailAddress =
      userlist[i].givenName +
      '.' +
      userlist[i].familyName +
      '@' +
      req.body.emailPrefix;
    userlist[i].password = req.body.password;

    try {
      const options = functions.getAPIOptions('POST', 'en-US');

      let userApiPath =
        process.env.LIFERAY_PATH + '/o/headless-admin-user/v1.0/user-accounts';
      const response = await axios.post(userApiPath, userlist[i], options);

      if (debug)
        console.log(
          'Created user:' +
            response.data.id +
            ', ' +
            response.data.alternateName
        );

      let userImageApiPath =
        process.env.LIFERAY_PATH +
        '/o/headless-admin-user/v1.0/user-accounts/' +
        response.data.id +
        '/image';
      let userImagePath = await getImagePath(gender, genderCount[gender]);

      if (debug) console.log('userImageApiPath:' + userImageApiPath);
      if (debug) console.log('userImagePath:' + userImagePath);
      if (debug)
        console.log(
          process.cwd() + '/public/users/user-images/' + userImagePath
        );

      let fileStream = fs.createReadStream(
        process.cwd() + '/public/users/user-images/' + userImagePath
      );
      const imgoptions = functions.getFilePostOptions(
        userImageApiPath,
        fileStream,
        'image'
      );

      request(imgoptions, function (err, res, body) {
        if (err) console.log(err);

        if (debug) console.log('Image Upload Complete');
      });

      successCount++;
    } catch (error) {
      errorCount++;
      console.log(error.code);
    }
  }

  let end = new Date().getTime();

  res.status(200).json({
    result:
      successCount +
      ' users added, ' +
      errorCount +
      ' errors in ' +
      functions.millisToMinutesAndSeconds(end - start),
  });
}

async function getImagePath(gender, index) {
  let options = {
    gender: gender,
    index: index,
  };

  let res = await axios.post('http://localhost:3000/api/userimages', options);

  return res.data.result;

  /*
    const folder = process.cwd()+"/public/users/user-images/";

    let styleList = [];

    fs.readdir(folder, (err, files) => {
        files.forEach(file => {
            if(file.startsWith(gender))
                styleList.push(file);
        });

        console.log(index+":"+styleList.length);
        
        return styleList[index];
    });
    */
}
