from flask import Blueprint, render_template, redirect, url_for
from datetime import datetime
from zoneinfo import ZoneInfo
from utils.auth_decorator import login_required
from flask import Flask, render_template
from db import conectar_bd
from flask import request
from flask import request, render_template
import psycopg2.extras
from flask import request, jsonify

app = Flask(__name__)

@app.route('/menu')
def menu():
    return render_template('menu.html')

views_bp = Blueprint("views", __name__)

@views_bp.route("/")
def home():
    return redirect(url_for("auth.login_page"))

# =========================
# PAGINA DE LOGIN
# =========================
@views_bp.route("/login-page")
def login_page():
    return render_template("login.html")

@views_bp.route("/recuperacaoSenha")
def recuperacao_senha():
    return render_template("recuperacaoSenha.html")

# =========================
# MENU
# =========================

@views_bp.route("/menu")
@login_required
def menu():
    return render_template("menu.html")

# =========================
# TELAS DENTRO DO MENU
# =========================

@views_bp.route("/controleponto")
def controle_ponto():
    return render_template("controleponto.html")

@views_bp.route("/perfil")
def perfil():
    return render_template("perfil.html")

@views_bp.route("/cadastroUsuario")
def cadastro_usuario():
    return render_template("cadastroUsuario.html")

@views_bp.route("/reconhecimentoFacial")
def reconhecimento_facial():
    return render_template("reconhecimentoFacial.html")

@views_bp.route("/cadastrarFoto")
@login_required
def cadastrar_foto():
    return render_template("cadastrarFoto.html")

@views_bp.route("/cadastroFotoNF")
@login_required
def cadastro_foto_nf():
    return render_template("cadastroFotoNF.html")

@views_bp.route("/redefinicaoSenha")
@login_required
def redefinicao_senha():
    return render_template("redefinicaoSenha.html")

@views_bp.route('/gerenciarUsuario')
def gerenciar_usuario():
    return render_template('gerenciarUsuario.html')

@views_bp.route("/configuracoes")
@login_required
def configuracoes():
    return render_template("configuracoes.html")

@views_bp.route("/editarUsuario")
@login_required
def editar_usuario():
    user_id = request.args.get("id")

    conn = conectar_bd()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cursor.execute("""
        SELECT 
            u.id,
            u.nome,
            u.email,
            u.telefone,
            u.cpf,
            f.cargo,
            f.setor,
            f.tipo_perfil,
            f.tipo_contrato,
            f.data_admissao
        FROM usuarios u
        LEFT JOIN funcionarios f ON u.id = f.usuario_id
        WHERE u.id = %s
    """, (user_id,))

    usuario = cursor.fetchone()

    cursor.close()
    conn.close()

    if not usuario:
        return "Usuário não encontrado", 404

    return render_template("editarUsuario.html", usuario=usuario)


@views_bp.route("/editarHorarios")
@login_required
def editar_horarios():
    user_id = request.args.get("id")

    conn = conectar_bd()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cursor.execute("""
        SELECT 
            u.id,
            u.nome,
            u.email,
            u.telefone,
            u.cpf,
            f.cargo,
            f.setor,
            f.tipo_perfil,
            f.tipo_contrato,
            f.data_admissao
        FROM usuarios u
        LEFT JOIN funcionarios f ON u.id = f.usuario_id
        WHERE u.id = %s
    """, (user_id,))

    usuario = cursor.fetchone()

    cursor.close()
    conn.close()

    if not usuario:
        return "Usuário não encontrado", 404

    return render_template("editarHorarios.html", usuario=usuario)

# =========================
# LISTAGEM DE USUÁRIOS
# =========================

from flask import jsonify
import psycopg2.extras

@views_bp.route("/listarUsuarios")
@login_required
def listar_usuarios():
    try:
        conn = conectar_bd()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT id, nome, cpf, 'ativo' as status
            FROM usuarios
        """)

        usuarios = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(usuarios)

    except Exception as e:
        print("ERRO:", e)
        return jsonify([]), 500

# =========================
# ALTERAÇÃO NO BANCO DE DADOS
# =========================

@views_bp.route("/atualizar_usuario", methods=["POST"])
def atualizar_usuario():
    try:
        dados = request.get_json()

        user_id = dados.get("id")
        nome = dados.get("nome")
        email = dados.get("email")

        conn = conectar_bd()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE usuarios
            SET nome = %s, email = %s
            WHERE id = %s
        """, (nome, email, user_id))

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"status": "ok"})

    except Exception as e:
        print("ERRO:", e)
        return jsonify({"status": "erro"})

# =========================
# HORA DO SERVIDOR
# =========================
@views_bp.route("/hora-servidor")
def hora_servidor():
    agora = datetime.now(ZoneInfo("America/Sao_Paulo"))

    dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    dia_semana = dias[agora.weekday()]

    return {
        "data": agora.strftime("%d/%m/%Y"),
        "hora": agora.strftime("%H:%M:%S"),
        "dia": dia_semana
    }

# =========================
# STATUS (MOCK)
# =========================
contador = 0

@views_bp.route("/status")
def status():
    global contador

    estados = ["expediente", "intervalo", "fora"]
    estado = estados[contador % 3]

    contador += 1

    return {
        "status": estado
    }

if __name__ == '__main__':
    app.run(debug=True)