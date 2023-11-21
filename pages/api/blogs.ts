import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: reviewPrompt(req.body.product),
    max_tokens: 150,
    temperature: 0.8,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0
  });
  res.status(200).json({ result: completion.data.choices[0].text });
}

function reviewPrompt(productName) {
  return `Topic: Breakfast
  Two-Sentence Story: As the morning sun painted the kitchen in warm hues, Sarah savored the simple joy of breakfast – the aroma of freshly brewed coffee and the crisp sound of bacon sizzling in the pan. Amidst the routine, she found a moment of serenity, a daily ritual that turned ordinary mornings into a comforting embrace of flavors and quiet reflection.
      
  Topic: ${productName}
  Two-Sentence Story:`;
}







