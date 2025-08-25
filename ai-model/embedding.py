import os
from langchain_community.document_loaders import ConfluenceLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_postgres import PGVector  # ✅ use new PGVector
from dotenv import load_dotenv

# Load env vars
load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")

# PGVector connection string
CONNECTION_STRING = os.getenv("PGVECTOR_CONNECTION")
COLLECTION_NAME = "confluence_docs"

def embed_and_save_documents():
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

    loader = ConfluenceLoader(
        url="https://hardikpandey1207.atlassian.net/wiki",
        username=os.getenv("CONFLUENCE_EMAIL"),
        api_key=os.getenv("CONFLUENCE_API_TOKEN"),
        cloud=True,
        space_key="DS"
    )
    print("✅ Initialized Confluence loader")

    docs = loader.load()
    print(f"📄 Loaded {len(docs)} documents")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    final_documents = text_splitter.split_documents(docs)
    print(f"🔹 Split into {len(final_documents)} chunks")

    # Store directly into PostgreSQL (pgvector)
    PGVector.from_documents(
        documents=final_documents,
        embedding=embeddings,
        connection=CONNECTION_STRING,   # ✅ new param name
        collection_name=COLLECTION_NAME,
        pre_delete_collection=True  # deletes old data each run
    )

    print(f"✅ Stored {len(final_documents)} chunks in PostgreSQL (collection: {COLLECTION_NAME})")

if __name__ == "__main__":
    embed_and_save_documents()
