import cloudinary
import cloudinary.uploader
from flask import Flask, render_template, request, jsonify
from deepface import DeepFace
import base64
import os
import mysql.connector
from datetime import datetime
import json
import numpy as np
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# =========================
# CLOUDINARY
# =========================
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_KEY"),
    api_secret=os.getenv("CLOUD_SECRET")
)

# =========================
# BANCO
# =========================
def conectar():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT"))
    )

# =========================
# CARREGAR MODELO
# =========================
print("Carregando modelo...")
DeepFace.build_model("Facenet512")
print("Modelo carregado!")

# =========================
# CALCULAR MÉDIA DOS EMBEDDINGS
# =========================
def atualizar_embedding_medio(nome):

    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute(
        "SELECT embedding FROM fotos WHERE nome = %s AND embedding IS NOT NULL",
        (nome,)
    )

    dados = cursor.fetchall()

    embeddings = []

    for d in dados:
        embeddings.append(np.array(json.loads(d["embedding"])))

    if len(embeddings) == 0:
        return

    media = np.mean(embeddings, axis=0)

    embedding_json = json.dumps(media.tolist())

    cursor.execute("""
    INSERT INTO pessoas_embeddings (nome, embedding)
    VALUES (%s, %s)
    ON DUPLICATE KEY UPDATE embedding = %s
    """, (nome, embedding_json, embedding_json))

    conexao.commit()

    cursor.close()
    conexao.close()

# =========================
# ROTAS
# =========================
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cadastrar')
def pagina_cadastro():
    return render_template('cadastrar.html')

# =========================
# CADASTRAR FOTO
# =========================
@app.route('/salvar_cadastro', methods=['POST'])
def salvar_cadastro():

    dados = request.get_json()

    nome = dados.get('nome')
    imagem = dados.get('imagem')

    if not nome or not imagem:
        return jsonify({"mensagem": "Dados inválidos!"})

    nome = nome.strip().title()

    if "," in imagem:
        imagem = imagem.split(",")[1]

    imagem_bytes = base64.b64decode(imagem)

    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute("SELECT COUNT(*) FROM fotos WHERE nome = %s", (nome,))
    numero_fotos = cursor.fetchone()[0]

    if numero_fotos >= 5:

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Limite de 5 fotos atingido!",
            "bloqueado": True
        })

    numero_fotos += 1

    upload = cloudinary.uploader.upload(
        imagem_bytes,
        folder=f"rostos/{nome}",
        public_id=str(numero_fotos),
        overwrite=True
    )

    url_imagem = upload["secure_url"]

    # gerar embedding
    embedding = DeepFace.represent(
        img_path=url_imagem,
        model_name="Facenet512",
        detector_backend="retinaface",
        enforce_detection=False
    )[0]["embedding"]

    embedding_json = json.dumps(embedding)

    cursor.execute(
        "INSERT INTO fotos (nome, url, embedding) VALUES (%s, %s, %s)",
        (nome, url_imagem, embedding_json)
    )

    conexao.commit()

    cursor.close()
    conexao.close()

    # atualizar média da pessoa
    atualizar_embedding_medio(nome)

    return jsonify({
        "mensagem": f"Foto {numero_fotos}/5 cadastrada!"
    })

# =========================
# RECONHECER
# =========================
@app.route('/reconhecer', methods=['POST'])
def reconhecer():

    dados = request.get_json()
    imagem = dados.get('imagem')

    if not imagem:
        return jsonify({"erro": "Imagem inválida!"})

    if "," in imagem:
        imagem = imagem.split(",")[1]

    imagem_bytes = base64.b64decode(imagem)

    temp_path = "temp.jpg"

    with open(temp_path, "wb") as f:
        f.write(imagem_bytes)

    try:

        embedding_input = DeepFace.represent(
            img_path=temp_path,
            model_name="Facenet512",
            detector_backend="retinaface",
            enforce_detection=False
        )[0]["embedding"]

        embedding_input = np.array(embedding_input)

        conexao = conectar()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute("SELECT nome, embedding FROM pessoas_embeddings")
        dados = cursor.fetchall()

        melhor_nome = None
        menor_distancia = 999

        for pessoa in dados:

            embedding_db = np.array(json.loads(pessoa["embedding"]))

            distancia = np.linalg.norm(embedding_input - embedding_db)

            if distancia < menor_distancia:
                menor_distancia = distancia
                melhor_nome = pessoa["nome"]

        if melhor_nome and menor_distancia < 10:

            agora = datetime.now()

            cursor.execute("""
            SELECT COUNT(*) as total FROM presenca
            WHERE nome = %s AND DATE(data_registro) = CURDATE()
            """, (melhor_nome,))

            existe = cursor.fetchone()["total"]

            if existe == 0:

                cursor.execute(
                    "INSERT INTO presenca (nome, data_registro) VALUES (%s, %s)",
                    (melhor_nome, agora)
                )

                conexao.commit()

            cursor.close()
            conexao.close()

            return jsonify({
                "nome": melhor_nome,
                "data_hora": agora.strftime("%d/%m/%Y %H:%M:%S")
            })

        else:
            return jsonify({"erro": "Rosto não reconhecido!"})

    except Exception as e:
        return jsonify({"erro": str(e)})

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)

# =========================
# INICIAR
# =========================
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)