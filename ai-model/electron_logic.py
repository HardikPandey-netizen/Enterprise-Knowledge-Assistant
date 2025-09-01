import os
from dotenv import load_dotenv
from langchain.memory import ConversationBufferWindowMemory
from langchain_postgres import PGVector 
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationalRetrievalChain

# Load environment
load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY")

# PGVector connection
CONNECTION_STRING = os.getenv("PGVECTOR_CONNECTION")
COLLECTION_NAME = "confluence_docs"

# Chat memory
memory = ConversationBufferWindowMemory(k=2, memory_key="chat_history", return_messages=True)

# Embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# Load from PostgreSQL instead of FAISS
db = PGVector(
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    connection=CONNECTION_STRING  
)
db_retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 4})

# Prompt template
prompt_template = """You are an Enterprise Knowledge Assistant. 
Your role is to provide accurate, concise, and professional information based on the user's questions. 
Use only the provided CONTEXT and CHAT HISTORY to answer the QUESTION.

Guidelines:
- Only use information from the CONTEXT to answer.
- If the answer is not in the CONTEXT, respond with: 
  "I’m not sure about this. Please consult the relevant team or documentation."
- Keep responses brief, clear, and professional.
- Do not generate your own questions or pose additional ones.

CONTEXT: {context}
CHAT HISTORY: {chat_history}
QUESTION: {question}
ANSWER:"""

prompt = PromptTemplate(template=prompt_template, input_variables=['context', 'question', 'chat_history'])

# LLM
llm = ChatGroq(groq_api_key=groq_api_key, model_name="groq/llama-3.1-8b-instant")

# Chain
qa = ConversationalRetrievalChain.from_llm(
    llm=llm,
    memory=memory,
    retriever=db_retriever,
    combine_docs_chain_kwargs={'prompt': prompt}
)

def get_response(question: str) -> str:
    result = qa.invoke({"question": question})
    return result["answer"]
