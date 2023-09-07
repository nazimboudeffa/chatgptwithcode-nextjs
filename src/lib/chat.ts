import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";

import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import fs from "fs";

export async function promptChatGPT( apiKey : string, prompt: string) {

  const loader = new DirectoryLoader("./src/data", {
    ".txt": (path) => new TextLoader(path),
  });

  console.log("Loading docs...");
  const docs = await loader.load();
  console.log("Loaded docs:", docs.length);

  const VECTOR_STORE_PATH = "./src/data-index";

  function normalizeDocs(docs : any) {
      return docs.map((doc : any) => {
        if (typeof doc.pageContent === "string") {
          return doc.pageContent;
        } else if (Array.isArray(doc.pageContent)) {
          return doc.pageContent.join("\n");
        }
      });
    }

  const model = new OpenAI({ openAIApiKey: apiKey });

  let vectorStore;

  console.log("Checking for existing vector store...");
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    // 14. Load the existing vector store
    console.log("Loading existing vector store...");
    vectorStore = await HNSWLib.load(
      VECTOR_STORE_PATH,
      new OpenAIEmbeddings({ openAIApiKey: apiKey })
    );
    console.log("Vector store loaded.");
  } else {
    // 15. Create a new vector store if one does not exist
    console.log("Creating new vector store...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const normalizedDocs = normalizeDocs(docs);
    const splitDocs = await textSplitter.createDocuments(normalizedDocs);

    // 16. Generate the vector store from the documents
    vectorStore = await HNSWLib.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({ openAIApiKey: apiKey })
    );
    // 17. Save the vector store to the specified path
    await vectorStore.save(VECTOR_STORE_PATH);

    console.log("Vector store created.");
  }

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  console.log("Creating retrieval chain...");
  const result = await chain.call({ query: prompt });
  console.log("Result:", result);
  return result
}