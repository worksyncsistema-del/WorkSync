from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime
from zoneinfo import ZoneInfo

app = Flask(__name__)

contador = 0

@app.route("/")
def home():
    return "WorkSync API online v1.2"

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

# ✅ LIBERA CORS
CORS(app)

def conectar_bd():
    return mysql.connector.connect(
        host="maglev.proxy.rlwy.net",
        port=10257,
        user="root",
        password="KPVdVzWbHHXSwfjZffVJlAOqJcXtFJgo",
        database="railway"
    )

@app.route("/login", methods=["POST"])
def login():
    dados = request.json

    cpf = dados["cpf"]
    senha = dados["senha"]

    conn = conectar_bd()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT nome FROM usuarios
        WHERE cpf=%s AND senha=%s
    """, (cpf, senha))

    usuario = cursor.fetchone()

    cursor.close()
    conn.close()

    if usuario:
        return jsonify({
            "status": "ok",
            "nome": usuario["nome"]
        })
    else:
        return jsonify({"status": "erro"})


import os

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )
