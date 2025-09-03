import os
from dotenv import load_dotenv
from langchain.memory import ConversationBufferWindowMemory
from langchain_postgres import PGVector 
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationalRetrievalChain
from sqlalchemy import create_engine


load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY")


CONNECTION_STRING = os.getenv("PGVECTOR_CONNECTION")
COLLECTION_NAME = "confluence_docs"


memory = ConversationBufferWindowMemory(k=0, memory_key="chat_history", return_messages=True)


embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")


engine = create_engine(
    CONNECTION_STRING,
    pool_pre_ping=True,
    pool_recycle=1800,
)

db = PGVector(
    embeddings=embeddings,
    collection_name=COLLECTION_NAME,
    connection=engine,
    use_jsonb=True,              # works better on Supabase
    pre_delete_collection=False, # don’t drop collection
    create_extension=False       # ⚡ prevent CREATE EXTENSION vector
)
db_retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 4})


prompt_template = """
You are an Enterprise Knowledge Assistant that helps users with information from company documentation.

Guidelines:
- Answer only based on the CONTEXT provided or general professional knowledge.
- Do NOT invent personal details (name, pronouns, location, email, social links, or company roles).
- Keep answers short, clear, and professional unless a detailed explanation is required.
- If the user greets (e.g., "hello", "hi"), respond politely with a short greeting (1–2 sentences max).
- Use Markdown for formatting:
  - Use bullet points or numbered lists when listing items.
  - Use **bold** for key terms.
  - Keep paragraphs short with line breaks.

CONTEXT: {context}
CHAT HISTORY: {chat_history}
QUESTION: {question}
ANSWER (Markdown):"""



prompt = PromptTemplate(template=prompt_template, input_variables=['context', 'question', 'chat_history'])

# LLM
llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama-3.1-8b-instant")

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
