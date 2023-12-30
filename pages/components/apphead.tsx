import Head from 'next/head';

export default function AppHead({ title }) {
  return (
    <Head>
      <title>Liferay OpenAI Content Wizard - {title}</title>
      <meta content="" name="description" />
      <link href="/favicon.ico" rel="icon" />
    </Head>
  );
}
