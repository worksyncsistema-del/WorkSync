from flask import Blueprint, request, jsonify
from db import conectar_bd
import cloudinary
import cloudinary.uploader
from deepface import DeepFace
import base64
import uuid
import os
import numpy as np
import cv2
from datetime import datetime
from dotenv import load_dotenv
from pgvector.psycopg2 import register_vector

load_dotenv()

face_bp = Blueprint("face", __name__)

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_KEY"),
    api_secret=os.getenv("CLOUD_SECRET")
)

print("Carregando modelo...")
DeepFace.build_model("Facenet")
print("Modelo carregado!")

# =========================
# CADASTRO
# =========================
@face_bp.route('/salvar_cadastro', methods=['POST'])
def salvar_cadastro():
    try:
        dados = request.get_json()
        nome = dados.get('nome')
        imagem = dados.get('imagem')

        if not nome or not imagem:
            return jsonify({"erro": "Dados inválidos!"})

        nome = nome.strip().title()

        if "," in imagem:
            imagem = imagem.split(",")[1]

        temp_path = f"{uuid.uuid4()}.jpg"

        with open(temp_path, "wb") as f:
            f.write(base64.b64decode(imagem))

        img = cv2.imread(temp_path)

        if img is None:
            os.remove(temp_path)
            return jsonify({"erro": "Erro ao ler imagem"})

        img = cv2.resize(img, (640, 480))
        cv2.imwrite(temp_path, img)

        conn = conectar_bd()
        register_vector(conn)
        cursor = conn.cursor()

        # limite de 5 fotos
        cursor.execute("SELECT COUNT(*) FROM fotos WHERE nome = %s", (nome,))
        numero_fotos = cursor.fetchone()[0]

        if numero_fotos >= 5:
            cursor.close()
            conn.close()
            os.remove(temp_path)

            return jsonify({
                "mensagem": "Limite de 5 fotos atingido!",
                "bloqueado": True
            })

        numero_fotos += 1

        # upload imagem
        upload = cloudinary.uploader.upload(
            temp_path,
            folder=f"rostos/{nome}",
            public_id=str(numero_fotos),
            overwrite=True
        )

        url_imagem = upload["secure_url"]

        # gerar embedding
        embedding = DeepFace.represent(
            img_path=temp_path,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=False
        )[0]["embedding"]

        embedding = np.array(embedding)
        embedding = embedding / np.linalg.norm(embedding)

        # 🔥 CONVERSÃO CORRETA
        embedding_list = [float(x) for x in embedding]

        # salvar no banco
        cursor.execute(
            "INSERT INTO fotos (nome, url, embedding) VALUES (%s, %s, %s)",
            (nome, url_imagem, embedding_list)
        )

        conn.commit()
        cursor.close()
        conn.close()

        os.remove(temp_path)

        return jsonify({
            "mensagem": f"Foto {numero_fotos}/5 cadastrada!",
            "quantidade": numero_fotos
        })

    except Exception as e:
        return jsonify({"erro": str(e)})

# =========================
# RECONHECIMENTO
# =========================
@face_bp.route('/reconhecer', methods=['POST'])
def reconhecer():
    try:
        dados = request.get_json()
        imagem = dados.get('imagem')

        if not imagem:
            return jsonify({"erro": "Imagem inválida!"})

        if "," in imagem:
            imagem = imagem.split(",")[1]

        temp_path = f"{uuid.uuid4()}.jpg"

        with open(temp_path, "wb") as f:
            f.write(base64.b64decode(imagem))

        img = cv2.imread(temp_path)

        if img is None:
            os.remove(temp_path)
            return jsonify({"erro": "Erro ao ler imagem"})

        img = cv2.resize(img, (640, 480))
        cv2.imwrite(temp_path, img)

        # detectar rosto
        faces = DeepFace.extract_faces(
            img_path=temp_path,
            detector_backend="opencv",
            enforce_detection=False
        )

        if len(faces) == 0:
            os.remove(temp_path)
            return jsonify({"erro": "Nenhum rosto detectado"})

        if faces[0]["confidence"] < 0.90:
            os.remove(temp_path)
            return jsonify({"erro": "Rosto não confiável"})

        # gerar embedding
        embedding_input = DeepFace.represent(
            img_path=temp_path,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=False
        )[0]["embedding"]

        embedding_input = np.array(embedding_input)
        embedding_input = embedding_input / np.linalg.norm(embedding_input)

        # 🔥 CONVERSÃO CORRETA
        embedding_input_list = [float(x) for x in embedding_input]

        conn = conectar_bd()
        register_vector(conn)
        cursor = conn.cursor()

        # 🔥 busca vetorial
        cursor.execute("""
            SELECT nome, embedding <-> %s::vector AS distancia
            FROM fotos
            ORDER BY distancia
            LIMIT 1
        """, (embedding_input_list,))

        resultado = cursor.fetchone()

        if resultado:
            melhor_nome = resultado[0]
            menor_distancia = resultado[1]
        else:
            melhor_nome = None
            menor_distancia = 999

        print("Distância:", menor_distancia)

        if melhor_nome and menor_distancia < 0.6:

            agora = datetime.now()
            data = agora.date()
            hora = agora.time().replace(microsecond=0)

            cursor.execute(
                "INSERT INTO presenca (nome, data_registro, horario_registro) VALUES (%s, %s, %s)",
                (melhor_nome, data, hora)
            )
            conn.commit()

            cursor.close()
            conn.close()
            os.remove(temp_path)

            return jsonify({
                "nome": melhor_nome,
                "data_hora": agora.strftime("%d/%m/%Y %H:%M:%S")
            })

        else:
            cursor.close()
            conn.close()
            os.remove(temp_path)
            return jsonify({"erro": "Rosto não reconhecido!"})

    except Exception as e:
        return jsonify({"erro": str(e)})