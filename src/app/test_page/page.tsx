// app/page.tsx
import OpenAI from 'openai';
import { OpenAIStream } from 'ai';
import { Suspense } from 'react';


// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
 
export default async function Page({
  searchParams,
}: {
  // note that using searchParams opts your page into dynamic rendering. See https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams: Record<string, string>;
}) {
  const search = new URLSearchParams(searchParams);
  const kw = search.get('kw') || '';
  
  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'user',
        content:
          searchParams['prompt'] ?? `${kw}`,
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
 
  const reader = stream.getReader();
  // We recursively render the stream as it comes in
  
  return (
    <div className="space-y-5 flex flex-col p-[200px] items-center">
      <h1 className="font-bold text-[30px]">Hello welcome to the demo!</h1>
      <p className="font-bold">Keyword received: </p>{kw}
          <div>
    <Suspense fallback={<p>Loading...</p>} >
     <p className='font-bold'>Generated AI text:</p> <br></br><Reader reader={reader} />
    </Suspense>
    </div>
    </div>

  );
}
 
async function Reader({
  reader,
}: {
  reader: ReadableStreamDefaultReader<any>;
}) {
  const { done, value } = await reader.read();
 
  if (done) {
    return null;
  }
 
  const text = new TextDecoder().decode(value);
 
  return (
    <span >
      {text}
      <Suspense fallback={<p>Loading...</p>} >
        <Reader reader={reader} />
      </Suspense>
    </span>
  );
}