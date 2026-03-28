from flask import Blueprint, render_template, redirect, url_for
from datetime import datetime
from zoneinfo import ZoneInfo
from utils.auth_decorator import login_required
from flask import Flask, render_template

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