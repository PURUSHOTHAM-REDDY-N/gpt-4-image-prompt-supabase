import OpenAI from "openai";

import { OpenAIStream, StreamingTextResponse } from 'ai'

import { initialProgrammerMessages } from "./messages";

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(req,res) {
  // console.log("req this is ",req.)
  const { content } = await req.json();
  console.log("content",content)

  const chatCompletion = await openai.chat.completions.create({
    messages: [ { role: "user", content }],
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: 300
  });
   
  const stream = OpenAIStream(chatCompletion)
 
  return new StreamingTextResponse(stream)

  // const response = chatCompletion
  // res.status(200).json({tesxt:response})
}