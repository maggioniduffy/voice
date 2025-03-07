import { NextResponse } from "next/server";
// import { TranslationServiceClient } from "@google-cloud/translate";

// // import OpenAI from "openai";
// // const openai = new OpenAI({
// //   apiKey: process.env.OPENAI_API_KEY,
// // });

// const translationClient = new TranslationServiceClient({
//   key: process.env.GOOGLE_API_KEY,
// });

// const projectId = "translateapp-452917";
// const location = "global";

// export async function POST(request: Request) {
//   const { targetLang, text, sourceLang } = await request.json();

//   const req = {
//     parent: `projects/${projectId}/locations/${location}`,
//     contents: [text],
//     mimeType: "text/plain", // mime types: text/plain, text/html
//     sourceLanguageCode: sourceLang,
//     targetLanguageCode: targetLang,
//   };

//   const [response] = await translationClient.translateText(req);
//   const traduction = response.translations?.[0].translatedText || "";
//   return NextResponse.json({
//     text: traduction,
//   });
// }

export async function POST(request: Request) {
  const { targetLang, text } = await request.json();

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText, status: response.status });
    }

    const res = await response.json();

    const traduction = res.data.translations[0].translatedText;
    console.log(JSON.stringify(res));
    console.log(traduction);
    return NextResponse.json({
      text: traduction,
    });
  } catch (error) {
    console.error("Error in API call: ", error);
    return NextResponse.json({ error: "Internal server error", status: 500 });
  }
}
