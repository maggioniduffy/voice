import { NextResponse } from "next/server";

import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { language, text } = await request.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You will bw provided with a sentence. Your tasks are to:
            - Detect the language of the sentence
            - Translate it into ${language}
            - Do not return anything other than the translated sentence.
            `,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return NextResponse.json({
    text: response.choices[0].message.content,
  });
}
