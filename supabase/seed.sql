create extension vector with schema extensions;

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(384) NOT NULL,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL
);