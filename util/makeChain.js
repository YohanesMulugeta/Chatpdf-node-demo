const { OpenAI } = require('langchain/llms/openai');
const { ConversationalRetrievalQAChain } = require('langchain/chains');

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `Instructions: Compose a comprehensive reply to the question using the document given.
If the document mention multiple subjects with the same name, create separate answers for each.
Only include information found in the document and don't add any additional information.
If the question does not relate to the document or the previous question and answer, simply state "I am only here to answer questions related to the document". Ignore outlier document which has nothing to do with the question.
Only answer what is asked. The answer should be short and concise. Answer step-by-step.:
{context}

Question: {question}
Helpful answer in markdown:`;

// const QA_PROMPT = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
// If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
// If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context provided and generate what the context is about.

// {context}

// Question: {question}
// Helpful answer in markdown:`;

module.exports = (vectorstore) => {
  const model = new OpenAI({
    temperature: 0.3, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorstore.asRetriever(), {
    qaTemplate: QA_PROMPT,
    questionGeneratorTemplate: CONDENSE_PROMPT,
    returnSourceDocuments: true, //The number of source documents returned is 4 by default
  });

  return chain;
};
