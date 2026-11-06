"""Writes film.json for the model Short "E se, de repente, o Pix parasse?" (E Se De Repente, pt-BR, 9:16, about 1 minute).

Copy this file for a new Short. Fictional people: Caio, dona Neide. Sources are in SOURCES.md. The future is reasoning, and the narration says so.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
from film_lang import C, D, F, HELD, I, L, M, S, T, W, a, big, counter, fx, hand, mv, p, phone, who, write  # noqa: E402


def caio(x=None, acts=None, face=None, **k):
    return who("caio", x, acts, face, **k)


def neide(x=None, acts=None, face=None, **k):
    return who("neide", x, acts, face, **k)


# ---------------------------------------------------------------- hook
L("h1", "Terça-feira, oito da manhã. Você vai pagar o café no Pix.", [
    I("O ponteiro do relógio do mercadinho chega às oito", "mercado", [p("clock", 960, 480, s=1.7, h=7, m=59, moves=[mv(4, 8, m=60)])], cx=1000, sfx=[fx("click", 4, 0.5)]),
    T("O polegar toca o botão de pagar no celular", [phone("pix", 960, 480, 1.0, r=-4, t2="R$ 9,50", t4="8:00", n=40), hand(1200, 1000, -22, {"x": 1120, "y": 820})], motes=True, on="Você", sfx=[fx("click", 12, 0.5)]),
], after=0.1)
L("h2", "Carregando. Carregando.", [
    C("Caio olha para a tela e espera", "mercado", [caio(acts=[a("lookDown", 4), a("face", 22, eyes="half", brow="flat")], face=F("dot"))], cx=1000),
], after=0.05)
L("h3", "Falha na conexão.", [
    D("A maquininha acende o erro em vermelho", [p("maquininha", 960, 480, s=1.3, n=8, moves=[mv(8, 3, x=948), mv(11, 3, x=972), mv(14, 3, x=960)])], z=1.0, sfx=[fx("buzz", 8, 0.35)]),
], after=0.1)
L("h4", "Atrás de você, a fila inteira olha para o celular.", [
    W("A fila do mercadinho olha para os celulares ao mesmo tempo", "mercado", [
        caio(860, acts=[a("turn", 4, to=0.6)], hold=HELD, key={"pose": "phoneUp"}),
        who("cliente", 1000, acts=[a("lookDown", 6)], hold=HELD, key={"pose": "phoneUp"}),
        who("gui", 1130, acts=[a("lookDown", 10)], hold=HELD, key={"pose": "phoneUp"}),
    ], cx=1000, z=0.95),
], after=0.15)
L("h5", "E se, de repente, o Pix parasse por um dia inteiro?", [
    D("O título acende sobre o escuro", [big("E SE, DE", 330, 118, c="#ffc857"), big("REPENTE...", 450, 118, c="#ffc857"), big("O PIX", 620, 150), big("PARASSE?", 770, 118)], sfx=[fx("boom", 0, 0.3, 60)], trans="torn"),
], after=0.2)

# ---------------------------------------------------------------- the scale
L("d1", "Em dezembro de 2025, o Brasil fez trezentos e treze milhões de Pix em um único dia.", [
    D("O contador sobe até 313 milhões", [counter(313, "PIX EM UM SÓ DIA", suf=" MI", n=40)]),
    W("A rua inteira paga com o celular, cada um na sua barraca", "rua", [caio(960, acts=[a("phoneUp", 4)], hold=HELD), who("gal", 1100, acts=[a("phoneUp", 10)], hold=HELD)], cx=1030, z=1.0, on="Brasil"),
], after=0.1)
L("d2", "Agora tira isso.", [
    D("O número despenca para zero", [p("big", 960, 480, text="0", w=300, c="#e0523f", moves=[mv(0, 6, s=1.12), mv(6, 8, s=1)])], sfx=[fx("boom", 0, 0.35, 48)], trans="torn"),
], after=0.15)

# ---------------------------------------------------------------- the day
L("e1", "Na primeira hora, provavelmente vira piada.", [
    C("Caio ri de lado, mostrando o celular", "rua", [caio(acts=[a("snapFace", 6, eyes="dot", mouth="smile", brow="high"), a("nod", 20)], face=F("dot"))], cx=960),
], after=0.05)
L("e2", "Na hora do almoço, a piada acaba.", [
    M("A dona do mercadinho cruza os braços e balança a cabeça", "mercado", [neide(960, acts=[a("face", 4, eyes="half", brow="flat"), a("turn", 14, to=-0.3), a("turn", 28, to=0.3)], behind=True)], cx=960, z=1.3),
], after=0.05)
L("e3", "Quem está sem dinheiro vivo volta para casa com fome.", [
    W("Caio deixa a bandeja e caminha para fora do mercadinho", "mercadoVazio", [caio(980, walks=[{"from": 4, "to": 60, "x0": 0, "x1": -180}], face=F("half", brow="worry"), dir=-1)], cx=880, z=1.1),
    C("Caio olha para baixo, sem saber o que fazer", "rua", [caio(acts=[a("lookDown", 4), a("sigh", 14)], face=F("sad", brow="worry"))], cx=1100, on="volta"),
], after=0.05)
L("e4", "A fila do caixa eletrônico deve dobrar a esquina.", [
    W("A fila para o caixa eletrônico cresce pela calçada", "ruaFechada", [
        who("guy2", 800, acts=[a("sigh", 8)]), who("gal", 920, acts=[a("lookUp", 6)]), caio(1040, acts=[a("turn", 4, to=-0.4)]), who("gal2", 1160, walks=[{"from": 3, "to": 44, "x0": 180, "x1": 0}], dir=-1),
    ], cx=980, z=0.9, props=[p("atm", 680, 720, s=0.9)]),
], after=0.1)
L("c1", "No Canadá, em 2022, uma pane derrubou uma operadora com mais de doze milhões de clientes.", [
    D("A palavra Canadá e o ano aparecem sobre o escuro", [big("CANADÁ", 420, 130), big("2022", 580, 110, c="#ffc857")], trans="torn"),
    C("Caio ergue o celular e procura sinal", "ruaFechada", [caio(acts=[a("lookUp", 4), a("face", 16, eyes="wide", brow="high", mouth="o")], face=F("dot"))], cx=980, on="pane"),
    D("O contador de clientes sobe até 12 milhões", [counter(12, "CLIENTES FORA DO AR", suf=" MI", n=30, c="#e0523f")], on="mais"),
], after=0.05)
L("c2", "E até o débito parou de passar.", [
    T("O cartão desliza na maquininha e nada acontece", [p("maquininha", 960, 470, s=1.1, n=10, moves=[mv(0, 8, y=462)]), hand(1180, 900, -20, {"x": 1080, "y": 760})], motes=True, sfx=[fx("buzz", 10, 0.3)]),
], after=0.15)

# ---------------------------------------------------------------- payoff
L("n1", "E a dona Neide? Não fecha. Ela abre um caderno.", [
    C("Dona Neide ergue as sobrancelhas, tranquila", "mercado", [neide(acts=[a("face", 4, eyes="dot", brow="high", mouth="smile"), a("nod", 20)], face=F("dot"))], cx=1000),
    T("O caderno de fiado abre em cima do balcão", [p("caderno", 960, 480, s=0.95, n=4, lines=["Caio: R$ 18,00", "Bia: R$ 9,90"], moves=[mv(0, 8, y=470)])], on="Ela", sfx=[fx("click", 4, 0.4)]),
], after=0.1)
L("n3", "No dia seguinte, o Pix volta. Mas muita gente provavelmente guarda uma nota na carteira.", [
    T("O celular mostra o pagamento confirmado", [phone("pix", 960, 480, 1.0, r=3, t2="R$ 18,00", t3="ok", t4="8:00", n=16), hand(1200, 1000, -20, {"x": 1130, "y": 850})], motes=True, sfx=[fx("ding", 8, 0.35)]),
    I("Uma nota amassada entra dobrada na carteira", "sala", [p("nota", 960, 480, s=1.3, text="20", moves=[mv(2, 12, y=440, r=-6)])], cx=960, on="Mas"),
    C("Caio guarda a carteira e sorri de canto", "sala", [caio(acts=[a("nod", 8), a("snapFace", 18, mouth="smile")], face=F("dot"))], cx=700, on="guarda"),
], after=0.15)
L("q1", "E você? Tem dinheiro vivo aí agora? Conta nos comentários.", [
    D("A pergunta acende sobre o escuro", [big("E VOCÊ?", 420, 140, c="#ffc857"), p("qmark", 960, 680, s=0.8, moves=[mv(0, 8, y=668)])]),
    C("Caio abre a carteira e olha para o espectador", "sala", [caio(acts=[a("snapFace", 4, eyes="wide", brow="high", mouth="o"), a("turn", 12, to=0.2)], face=F("dot"))], cx=700, on="Tem"),
    D("O convite para comentar aparece", [big("CONTA AÍ", 440, 130), big("NOS COMENTÁRIOS", 590, 66, c="#ffc857")], on="Conta"),
], after=0.1)

SECTIONS = {
    "h1": [[110.0, 164.8, 220.0], -2],
    "d1": [[98.0, 146.8, 246.9], -1],
    "e1": [[87.3, 130.8, 220.0], -1],
    "n1": [[110.0, 164.8, 246.9], 0],
}
write(__file__, "E se, de repente, o Pix parasse?", SECTIONS)
