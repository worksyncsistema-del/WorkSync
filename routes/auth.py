from flask import Blueprint, request, jsonify
import psycopg2.extras
from db import conectar_bd

auth_bp = Blueprint("auth", __name__)

# =========================
# LOGIN DEV (CPF)
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        dados = request.get_json()

        cpf = dados.get("cpf")
        senha = dados.get("senha")

        if not cpf or not senha:
            return jsonify({"erro": "Dados inválidos"})

        cpf = cpf.replace(".", "").replace("-", "")

        conn = conectar_bd()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT cpf, senha
            FROM devs_login
            WHERE cpf = %s
        """, (cpf,))

        dev = cursor.fetchone()

        cursor.close()
        conn.close()

        if not dev:
            return jsonify({"erro": "CPF não encontrado"})

        if senha == dev["senha"]:
            return jsonify({
                "status": "ok",
                "cpf": dev["cpf"]
            })

        return jsonify({"erro": "Senha incorreta"})

    except Exception as e:
        return jsonify({"erro": str(e)})

# =========================
# CADASTRO DE USUÁRIO
# =========================
@auth_bp.route('/cadastrar_usuario', methods=['POST'])
def cadastrar_usuario():
    try:
        dados = request.get_json()

        conn = conectar_bd()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            INSERT INTO usuarios (nome, email, telefone, cpf)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (
            dados['nome'],
            dados['email'],
            dados['telefone'],
            dados['cpf']
        ))

        usuario_id = cursor.fetchone()['id']

        cursor.execute("""
            INSERT INTO funcionarios (
                usuario_id, cargo, setor, tipo_perfil,
                matricula, data_admissao, tipo_contrato,
                carga_horaria, jornada_padrao
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            usuario_id,
            dados['cargo'],
            dados['setor'],
            dados['tipo_perfil'],
            dados['matricula'],
            dados['data_admissao'],
            dados['tipo_contrato'],
            dados['carga_horaria'],
            dados['jornada']
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "status": "ok",
            "mensagem": "Usuário cadastrado com sucesso"
        })

    except Exception as e:
        return jsonify({
            "status": "erro",
            "mensagem": str(e)
        })