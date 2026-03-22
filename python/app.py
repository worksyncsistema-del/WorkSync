from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import datetime
from zoneinfo import ZoneInfo
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# =========================
# CORS
# =========================
CORS(app)

# =========================
# CONTROLE MOCK
# =========================
contador = 0

@app.route("/cadastro")
def home():
    return "./html/cadastro.html"

@app.route("/hora-servidor")
def hora_servidor():
    agora = datetime.now(ZoneInfo("America/Sao_Paulo"))

    dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    dia_semana = dias[agora.weekday()]

    return jsonify({
        "data": agora.strftime("%d/%m/%Y"),
        "hora": agora.strftime("%H:%M:%S"),
        "dia": dia_semana
    })

@app.route("/status")
def status():
    global contador

    estados = ["expediente", "intervalo", "fora"]
    estado = estados[contador % 3]

    contador += 1

    return jsonify({
        "status": estado
    })

# =========================
# CONEXÃO POSTGRESQL (SUPABASE)
# =========================
def conectar_bd():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dbname=os.getenv("DB_NAME"),
        port=os.getenv("DB_PORT")
    )

# =========================
# LOGIN
# =========================
@app.route("/login", methods=["POST"])
def login():
    try:
        dados = request.get_json()

        cpf = dados.get("cpf")
        senha = dados.get("senha")

        if not cpf or not senha:
            return jsonify({"status": "erro", "mensagem": "Dados inválidos"})

        conn = conectar_bd()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT nome, senha_hash
            FROM usuarios
            WHERE cpf = %s
        """, (cpf,))

        usuario = cursor.fetchone()

        cursor.close()
        conn.close()

        if not usuario:
            return jsonify({"status": "erro", "mensagem": "Usuário não encontrado"})

        # ⚠️ TEMPORÁRIO (sem bcrypt)
        if senha == usuario["senha_hash"]:
            return jsonify({
                "status": "ok",
                "nome": usuario["nome"]
            })
        else:
            return jsonify({"status": "erro", "mensagem": "Senha incorreta"})

    except Exception as e:
        return jsonify({"status": "erro", "mensagem": str(e)})

# =========================
# INICIAR SERVIDOR
# =========================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5500)),
        debug=True
    )