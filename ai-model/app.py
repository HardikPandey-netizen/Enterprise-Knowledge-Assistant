import os
import streamlit as st
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationalRetrievalChain
from dotenv import load_dotenv
from nltk.translate.bleu_score import sentence_bleu
from rouge_score import rouge_scorer
from bert_score import score as bert_score

# Load environment variables
load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY")

# Page setup
st.set_page_config(page_title="Sachetak - Legal Chatbot", page_icon="📜")
st.title("📜 Sachetak - Legal Chatbot")

# Initialize session state
if "memory" not in st.session_state:
    st.session_state.memory = ConversationBufferWindowMemory(
        k=2, memory_key="chat_history", return_messages=True
    )

if "qa" not in st.session_state:
    # Set up embeddings and retriever
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    db = FAISS.load_local("my_vector_store", embeddings, allow_dangerous_deserialization=True)
    retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 4})

    # Prompt template
    prompt_template = """
    <s>[INST]This is a chat template and as a legal chat bot, your primary objective is
    to provide accurate and concise information based on the user's questions. 
    Do not generate your own questions and answers.
      You will adhere strictly to the instructions provided, offering relevant context
        from the knowledge base while avoiding unnecessary details. Your responses will be brief, to the point, and in 
        compliance with the established format. If a question falls outside the given context, you will refrain from utilizing the 
        chat history and instead rely on your own knowledge base to generate an appropriate response. You will prioritize the user's query 
        and refrain from posing additional questions. The aim is to deliver professional, precise, and contextually relevant information 
        pertaining to the Indian Penal Code.
    CONTEXT: {context}
    CHAT HISTORY: {chat_history}
    QUESTION: {question}
    ANSWER:
    </s>[INST]
    """
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question", "chat_history"])

    # Initialize LLM
    llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama3-70b-8192")

    # Create QA chain
    st.session_state.qa = ConversationalRetrievalChain.from_llm(
        llm=llm,
        memory=st.session_state.memory,
        retriever=retriever,
        combine_docs_chain_kwargs={'prompt': prompt}
    )

# Input field for user's question
user_input = st.chat_input("Ask a legal question based on IPC...")

# Evaluation Function
def evaluate_response(reference: str, response: str):
    # BLEU Score
    bleu = sentence_bleu([reference.split()], response.split())

    # ROUGE-L Score
    scorer = rouge_scorer.RougeScorer(['rougeL'], use_stemmer=True)
    scores = scorer.score(reference, response)
    rouge_l = scores['rougeL'].fmeasure

    # BERTScore
    P, R, F1 = bert_score([response], [reference], lang="en", verbose=False)

    return {
        "BLEU (n-gram overlap)": round(bleu, 3),
        "ROUGE-L (content recall)": round(rouge_l, 3),
        "BERTScore-F1 (semantic similarity)": round(F1.item(), 3)
    }

# Chat interface
if user_input:
    with st.spinner("🤖 Thinking..."):
        result = st.session_state.qa.invoke(input=user_input)
        st.chat_message("user").write(user_input)
        st.chat_message("assistant").write(result["answer"])

        # Store the result in session state for evaluation
        st.session_state.last_response = result

# Evaluation section
if "last_response" in st.session_state:
    with st.expander("📊 Evaluate Response Quality"):
        st.write("Enter the correct reference answer to evaluate the bot's response:")
        
        reference_answer = st.text_area("Reference Answer:", key="ref_answer")
        evaluate_btn = st.button("Evaluate")
        
        if evaluate_btn and reference_answer:
            try:
                evaluation = evaluate_response(
                    reference_answer, 
                    st.session_state.last_response["answer"]
                )
                
                st.markdown("### Evaluation Results")
                st.write("Metrics comparing the bot's response to your reference answer:")
                
                # Display metrics in a cleaner format
                for metric, value in evaluation.items():
                    st.metric(label=metric, value=value)
                
            except Exception as e:
                st.error(f"Evaluation failed: {str(e)}")