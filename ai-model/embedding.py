import os
from langchain_community.document_loaders import ConfluenceLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_postgres import PGVector
from dotenv import load_dotenv
from bs4 import BeautifulSoup


load_dotenv()
os.environ['GOOGLE_API_KEY'] = os.getenv("GOOGLE_API_KEY")

CONNECTION_STRING = os.getenv("PGVECTOR_CONNECTION")
COLLECTION_NAME = "confluence_docs"


for var_name in ["GOOGLE_API_KEY", "CONFLUENCE_EMAIL", "CONFLUENCE_API_TOKEN", "PGVECTOR_CONNECTION"]:
    if not os.getenv(var_name):
        raise ValueError(f"Environment variable {var_name} is missing!")

def embed_and_save_documents():
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

    loader = ConfluenceLoader(
        url="https://hardikpandey1207-1756804987335.atlassian.net/wiki",
        username=os.getenv("CONFLUENCE_EMAIL"),
        api_key=os.getenv("CONFLUENCE_API_TOKEN"),
        cloud=True,
        space_key="~7120202557e38aa702492da1f8a35729c43dde"
    )
    print("✅ Initialized Confluence loader")

    try:
        raw_docs = loader.load()  # List of Documents with HTML content
        print(f"📄 Loaded {len(raw_docs)} documents")
    except Exception as e:
        print("❌ Failed to load Confluence pages:", e)
        return

    
    docs = []
    for doc in raw_docs:
        if hasattr(doc, "page_content"):
            doc.page_content = BeautifulSoup(doc.page_content, "html.parser").get_text()
            docs.append(doc)

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    final_documents = text_splitter.split_documents(docs)
    print(f"🔹 Split into {len(final_documents)} chunks")

    PGVector.from_documents(
        documents=final_documents,
        embedding=embeddings,
        connection=CONNECTION_STRING,
        collection_name=COLLECTION_NAME,
        pre_delete_collection=False,   # ❌ don’t wipe collection on every run
        create_extension=False,        # ❌ Supabase already has pgvector
        use_jsonb=True                 # ✅ recommended for Supabase
    )

    print(f"✅ Stored {len(final_documents)} chunks in PostgreSQL (collection: {COLLECTION_NAME})")

if __name__ == "__main__":
    embed_and_save_documents()
