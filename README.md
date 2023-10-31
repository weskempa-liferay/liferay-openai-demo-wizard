# Liferay OpenAI Demo Wizard Project

Using this application you can quickly configure content for demo purposes. It uses Open AI's API and Node.js

In this example app, you enter the name of a product and it outputs a product review, formatted in a very specific way in markdown. You can use this as a starting point to build purpose-built generative API functionality.

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

1. Add your [API key]([https://beta.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)) to the newly created `.env` file

1. Run the app

```bash
npm run dev
```

You should now be able to access the app at [http://localhost:3000](http://localhost:3000). Happy hacking.

## Deployment

TBD
