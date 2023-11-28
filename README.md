# Liferay OpenAI Content Creation Wizard 

With this application, creating content for Liferay demo purposes is a breeze!

Consider this scenario: You can create 15 products across 5 categories, without image generation, in just 35 seconds with a single prompt from you. The magic happens through the integration of OpenAI's API for content creation and Liferay's APIs for seamless storage based on your prompts.

Utilizing OpenAI to infuse content into our demos doesn't just speed up content creation, which many of us are already doing with AI. It goes the extra mile by seamlessly loading it into the demo instance through our APIs. Big kudos to **Steven Lu**, who, alongside contributing significantly to Commerce and its related APIs, identified the potential to optimize the time spent on setting up commerce products, categories, and SKUs.

**The application current support creating the following asset types:**

- Commerce Categories and Products with Images
- Blogs with Images
- FAQs

As we move forward, expect more options for different content types. A big shoutout to Steven Lu for the inspiration and knowledge that brought this functionality to life! Cheers!

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
