# Liferay OpenAI Content Creation Wizard 

With this application, creating content for Liferay demo purposes is a breeze!

Consider this scenario: You can create 15 products across 5 categories in just 35 seconds with a single prompt from you. The magic happens through the integration of OpenAI's API for content creation and Liferay's APIs for seamless storage based on your prompts.

Utilizing this OpenAI Wizard doesn't just speed up content creation, which many of us are already doing with AI. It goes the extra mile by seamlessly loading it into the demo instance through our Liferay APIs. Big kudos to **Steven Lu**, who, alongside contributing significantly to Commerce and its related APIs, identified the potential to optimize the time spent on setting up commerce products, categories, and SKUs.
  
<img width="853" alt="AIWizard-Screenshot" src="https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/82270f10-bd36-40cd-bc4e-cd2d1bebda5b">

## The Liferay Content Wizard currently supports generating these asset types: 

- **Commerce Categories and Products with Images**
- **Blogs with Images**
- **FAQs**
- **News Articles with Images**
- **Custom Liferay Objects Schemas**
- **Users**

As we move forward, expect more options for different content types. A big shoutout to Steven Lu for the inspiration and knowledge that brought this functionality to life! Cheers!

![Screenshot 2023-11-30 at 6 08 12 PM](https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/7f07aa98-a43a-4544-aed9-e9a152ba6fb3)
![Screenshot 2023-11-30 at 6 09 19 PM](https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/3d733f48-a6cc-48e6-af4c-b0578542befa)
![Screenshot 2023-11-30 at 6 02 49 PM](https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/7b60a262-e9af-47b4-bbae-7b58d30ee367)


Technologies used:

- [OpenAI API](https://openai.com/api/)
- [Node.js](https://nodejs.org/en/)
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Highlight.js](https://highlightjs.org/)

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
