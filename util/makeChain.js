const { OpenAI } = require('langchain/llms/openai');
const { ConversationalRetrievalQAChain } = require('langchain/chains');

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question. if the follow up question is unrelated to the conversation make the standalone question to be same as the follow up question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

// const QA_PROMPT = `Instructions: Compose a comprehensive reply to the question using the document given.
// If the document mention multiple subjects with the same name, create separate answers for each.
// Only include information found in the document and don't add any additional information.
// If the question does not relate to the document or the previous question and answer, replay politely that you are here to help with only questions related to the document. Ignore outlier document which has nothing to do with the question.
// Only answer what is asked. The answer should be short and concise. Answer step-by-step.:
// {context}

// Question: {question}
// Helpful answer in markdown:`;

const QA_PROMPT = `You are a helpful AI assistant. Use the following pieces of document to answer the question at the end.
The qustion may be to ask you to generate a social media or blog post based on the document, In that case generate a sample social media or blog post only if there is a question to generate a post
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
IF there is a document-title or a page-num please or both respond those as a citation at the end of your response on every response

{context}

Question: {question}
Helpful answer in markdown:`;

const qa_prompt = (
  includeSource = true
) => `You are a helpful AI assistant. Use the following pieces of document to answer the question at the end.
The qustion may be to ask you to generate a social media or blog post based on the document, In that case generate a sample social media or blog post only if there is a question to generate a post
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
${
  includeSource
    ? 'IF there is a document-title or a page-num please or both respond those as a citation at the end of your response on every response'
    : ''
}

{context}

Question: {question}
Helpful answer in markdown:`;

module.exports = (vectorstore, callbacks, includeSource = true) => {
  const model = new OpenAI({
    temperature: 0.3, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
    streaming: true,
    callbacks: [callbacks],
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorstore.asRetriever(), {
    qaTemplate: qa_prompt(includeSource),
    questionGeneratorTemplate: CONDENSE_PROMPT,
    returnSourceDocuments: true, //The number of source documents returned is 4 by default
  });

  return chain;
};
