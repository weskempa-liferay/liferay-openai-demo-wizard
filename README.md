# Liferay OpenAI Content Creation Wizard 

With this application, creating content within Liferay is a breeze!

Consider this scenario: You can create 15 products across 5 categories in just 35 seconds with a single prompt from you. The magic happens through the integration of OpenAI's API for content creation and Liferay's APIs for seamless storage based on your prompts.

Utilizing this OpenAI Wizard doesn't just speed up content creation, which many of us are already doing with AI. It goes the extra mile by seamlessly loading it into the demo instance through our Liferay APIs. Big kudos to Steven Lu, who helped identify the potential to optimize the time spent on setting up commerce products, categories, and SKUs through Liferay's Headless APIs which then led to the original idea for this integration.
  
![AIWizard-Screenshot](https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/eafd4327-492c-4fcf-81e8-2d3abfa9f8f7)

## The Liferay Content Wizard currently supports generating these asset types: 

- **Accounts**
- **Blogs with Images**
- **Taxonomy with Category Structure**
- **Multilingual FAQs**
- **Generation of Images within Documents and Media with a choice of dimensions and quality**
- **Knowledge Base Folders and Articles**
- **Message Board Sections, Threads, and Messages**
- **Multilingual News Articles with Images**
- **Custom Liferay Objects Schemas**
- **Organization Structures**
- **Page Hierarchies (AI Generation and File Upload)**
- **Commerce Categories and Products with Images (AI Generation and File Upload)**
- **Users (AI Generation and File Upload)**
- **User Groups**
- **Warehouses with Latitude and Longitude**
- **Wiki Nodes and Pages**

As we move forward, expect more options and deeper integrations for content types.

> [!TIP]
> Frequent updates are expected so it is recommended that you update often. 

![Wizard Dashboard](https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/5f4f6f98-24c5-4785-8ac8-da12b75661da)

![287095500-3d733f48-a6cc-48e6-af4c-b0578542befa](https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/de136608-8e95-4a74-bc16-08506570d7b9)

![287095038-7b60a262-e9af-47b4-bbae-7b58d30ee367](https://github.com/weskempa-liferay/liferay-openai-demo-wizard/assets/68334638/e7ed2ee8-a369-41da-aae2-deccf4c97b48)


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

Once you have this up and running locally, fill in the required Environment Details. I am considering UI-based configurations, but for now, it is required to configure these settings in your environment variables. 

```bash
OPENAI_API_KEY= <key goes here>
LIFERAY_PATH= <HTTP: or HTTPS: URL for the server, examples http://localhost:8080, http://127.0.0.1:8080, or https://webserver-lctexample-prd.lfr.cloud>
LIFERAY_ADMIN_EMAIL_ADDRESS=
LIFERAY_ADMIN_PASSWORD=
```

> [!TIP]
> Your feedback and suggestions are useful to us. Please share your ideas for improvements!

> [!IMPORTANT]
> This is a personal project not directly supported by Liferay Inc.

# Let's build great things!
