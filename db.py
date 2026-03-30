import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def conectar_bd():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dbname=os.getenv("DB_NAME"),
        port=os.getenv("DB_PORT"),
        sslmode="require"
    )


def buscar_usuario_por_email(email):
    conn = conectar_bd()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = "SELECT * FROM usuarios WHERE email = %s"
    cursor.execute(query, (email,))
    user = cursor.fetchone()

    conn.close()
    return user

def salvar_token(user_id, token):
    conn = conectar_bd()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = "UPDATE usuarios SET token_reset = %s WHERE id = %s"
    cursor.execute(query, (token, user_id))

    conn.commit()
    conn.close()

def atualizar_senha(user_id, senha_hash):
    conn = conectar_bd()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = "UPDATE usuarios SET senha_hash = %s WHERE id = %s"
    cursor.execute(query, (senha_hash, user_id))

    conn.commit()
    conn.close()

def limpar_token(user_id):
    conn = conectar_bd()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = "UPDATE usuarios SET token_reset = NULL WHERE id = %s"
    cursor.execute(query, (user_id,))

    conn.commit()
    conn.close()