# Liferay OpenAI Content Creation Wizard 

Using this application you can quickly configure content for Liferay demo purposes. It uses Open AI's API, Liferay's APIs, and Next.js

Contributions are welcome! We can use this as a starting point to build purpose-built generative API functionality using Liferay's headless APIs. 

**Thank you Steven Lu** for the inspiration and knowledge that helped make this functional!

Technologies used:

- [OpenAI API](https://openai.com/api/)
- [Node.js](https://nodejs.org/en/)
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Highlight.js](https://highlightjs.org/)
  
![Index](https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/3ec81d2a-09a3-42ec-aee9-f27cb5cbc538)

## Setup

1. If you don’t have Node.js installed, [install it from here](https://nodejs.org/en/)

1. Clone this repository

1. Navigate into the project directory

```bash
cd liferay-openai-demo-wizard
```  

1. Install the requirements

```bash
npm install
```

1. Make a copy of the example environment variables file

```bash
cp .env.example .env
```

1. Add your OpenAI [API key]([https://beta.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)) to the newly created `.env` file as well as fill in the details of your server.

1. Run the app

```bash
npm run dev
```

You should now be able to access the app at [http://localhost:3000](http://localhost:3000). 

## Deployment

Once you have this up and running locally, make sure to fill in the required Environment Details. These might become UI-based configurations, but for now it is required to configure these settings in your environment variables. 

```bash
OPENAI_API_KEY=<key goes here>
LIFERAY_PATH=
LIFERAY_ADMIN_EMAIL_ADDRESS=
LIFERAY_ADMIN_PASSWORD=
LIFERAY_GLOBAL_SITE_ID=
LIFERAY_CATALOG_ID=
```

## Lets build great things!
