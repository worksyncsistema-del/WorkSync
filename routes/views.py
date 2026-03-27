from flask import Blueprint, render_template, redirect, url_for
from datetime import datetime
from zoneinfo import ZoneInfo
from utils.auth_decorator import login_required

views_bp = Blueprint("views", __name__)

@views_bp.route("/")
def home():
    return redirect(url_for("auth.login_page"))

@views_bp.route("/login-page")
def login_page():
    return render_template("login.html")

@views_bp.route("/menu")
@login_required
def menu():
    return render_template("menu.html")

@views_bp.route("/controleponto")
def controle_ponto():
    return render_template("controleponto.html")

@views_bp.route("/index")
def index():
    return render_template("index.html")

@views_bp.route("/cadastro")
def cadastro():
    return render_template("cadastro.html")

@views_bp.route("/cadastrar")
@login_required
def cadastrar_face():
    return render_template("cadastrar.html")


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