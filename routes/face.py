from flask import Blueprint, request, jsonify
from db import conectar_bd
import cloudinary
import cloudinary.uploader
from deepface import DeepFace
import base64
import uuid
import os
import json
import numpy as np
import cv2
from datetime import datetime
from dotenv import load_dotenv

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
        cursor = conn.cursor()

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

        upload = cloudinary.uploader.upload(
            temp_path,
            folder=f"rostos/{nome}",
            public_id=str(numero_fotos),
            overwrite=True
        )

        url_imagem = upload["secure_url"]

        embedding = DeepFace.represent(
            img_path=temp_path,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=False
        )[0]["embedding"]

        embedding = np.array(embedding)
        embedding = embedding / np.linalg.norm(embedding)

        embedding_json = json.dumps(list(embedding))

        cursor.execute(
            "INSERT INTO fotos (nome, url, embedding) VALUES (%s, %s, %s)",
            (nome, url_imagem, embedding_json)
        )

        conn.commit()
        cursor.close()
        conn.close()

        os.remove(temp_path)

        return jsonify({
            "mensagem": f"Foto {numero_fotos}/5 cadastrada!"
        })

    except Exception as e:
        return jsonify({"erro": str(e)})

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

        embedding_input = DeepFace.represent(
            img_path=temp_path,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=False
        )[0]["embedding"]

        embedding_input = np.array(embedding_input)
        embedding_input = embedding_input / np.linalg.norm(embedding_input)

        conn = conectar_bd()
        cursor = conn.cursor()

        cursor.execute("SELECT nome, embedding FROM fotos")
        pessoas = cursor.fetchall()

        melhor_nome = None
        menor_distancia = 999

        for pessoa in pessoas:
            nome_db = pessoa[0]
            embedding_db = np.array(json.loads(pessoa[1]))

            distancia = np.linalg.norm(embedding_input - embedding_db)

            if distancia < menor_distancia:
                menor_distancia = distancia
                melhor_nome = nome_db

        print("Distância encontrada:", menor_distancia)

        if melhor_nome and menor_distancia < 0.9:

            agora = datetime.now()

            cursor.execute("""
                SELECT COUNT(*) FROM presenca
                WHERE nome = %s AND DATE(data_registro) = CURRENT_DATE
            """, (melhor_nome,))

            existe = cursor.fetchone()[0]

            if existe == 0:
                cursor.execute(
                    "INSERT INTO presenca (nome, data_registro) VALUES (%s, %s)",
                    (melhor_nome, agora)
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