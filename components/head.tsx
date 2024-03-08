import Head from 'next/head';

export default function AppHead({ title }) {
  const titleText = 'Liferay OpenAI Content Wizard - ' + title;

  return (
    <Head>
      <title>{titleText}</title>
      <meta content="" name="description" />
      <link href="/favicon.ico" rel="icon" />
    </Head>
  );
}
