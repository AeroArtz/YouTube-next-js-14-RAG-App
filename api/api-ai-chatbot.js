import { NextResponse } from "next/server";
import { XataVectorSearch } from "@langchain/community/vectorstores/xata";
import {
  RunnableSequence,
} from "@langchain/core/runnables";

import { HttpResponseOutputParser } from 'langchain/output_parsers';

import {   PromptTemplate } from "@langchain/core/prompts";

import {
  Message as VercelChatMessage,
  StreamingTextResponse,
  createStreamDataTransformer,
} from 'ai';

import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { getXataClient } from "@/xata";
import { authorized } from "@/utils/auth";
   

const apiKey = process.env.GEMINI_API_KEY;

const combineDocumentsFn = (docs) => {
    const serializedDocs = docs.map((doc) => doc.pageContent);
    return serializedDocs.join("\n\n");
  };

  
  const formatMessage = (message) => {
    return `${message.role}: ${message.content}`;
};
 
const TEMPLATE = `You are an assistant for question-answering tasks. Use only the following pieces of retrieved context and chat history to answer the question. If you don't know the answer, just reply kindly that you don't know:
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
assistant:`;


export async function POST(req) {
	try {

        // DO AUTHENTICATION

        const { messages } = await req.json();

        const xata = getXataClient();

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

        const currentMessageContent = messages[messages.length - 1].content;

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            apiKey : apiKey
        });
        
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey : apiKey,
            model: "embedding-001", // 768 dimensions
        })

        const vectorStore = new XataVectorSearch(embeddings, { client:xata, table:"vectors" });

        const retriever = vectorStore.asRetriever();


        const retrievalChain = retriever.pipe(combineDocumentsFn);

        /**
       * Chat models stream message chunks rather than bytes, so this
       * output parser handles serialization and encoding.
       */
        const parser = new HttpResponseOutputParser();

        const chain = RunnableSequence.from([
            {
                question: (input) => input.question,
                chat_history: (input) => input.chat_history,
                context: () =>  RunnableSequence.from([
                    (input) => input.question,
                    retrievalChain,
                  ]),
            },
            prompt,
            model,
            parser,
        ]);

        // Convert the response into a friendly text-stream
        const stream = await chain.stream({
            chat_history: formattedPreviousMessages.join('\n'),
            question: currentMessageContent,
        });

        // Respond with the stream
        return new StreamingTextResponse(
            stream.pipeThrough(createStreamDataTransformer()),
        );


    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: "Unexpected error occurred" }, { status: 500 });
    }

}









 
