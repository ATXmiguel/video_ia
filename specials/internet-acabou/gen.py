"""Writes film.json for "E se, de repente, a internet acabasse?" (E Se De Repente, pt-BR).

Script and direction live together here: 200-odd shots are too many to keep as hand-written JSON.
Fictional people: Caio, Dona Neide, Bia, Lena. Sources for every real fact are in SOURCES.md.
Anything about the future is reasoning, and the narration says so.
"""
import json
from pathlib import Path

HERE = Path(__file__).parent


# ---------------------------------------------------------------- small language for shots
def a(name, at=6, **k):
    return {"a": name, "at": at, **k}


def p(prop, x=960, y=540, **k):
    return {"p": prop, "x": x, "y": y, **k}


def mv(at, dur=8, **k):
    return {"at": at, "dur": dur, **k}


def fx(s, at=0, v=0.4, length=None):
    d = {"s": s, "at": at, "v": v}
    if length:
        d["len"] = length
    return d


def who(name, x=None, acts=None, face=None, **k):
    c = {"who": name}
    if x is not None:
        c["x"] = x
    if acts:
        c["acts"] = acts
    if face:
        c["face"] = face
    c.update(k)
    return c


def F(eyes="dot", mouth="flat", brow=None, look=None, lookY=None):
    d = {"eyes": eyes, "mouth": mouth}
    if brow:
        d["brow"] = brow
    if look is not None:
        d["look"] = look
    if lookY is not None:
        d["lookY"] = lookY
    return d


def caio(x=None, acts=None, face=None, **k):
    return who("caio", x, acts, face, **k)


def neide(x=None, acts=None, face=None, **k):
    return who("neide", x, acts, face, **k)


def bia(x=None, acts=None, face=None, **k):
    return who("bia", x, acts, face, **k)


def extra(n, x, acts=None, face=None, **k):
    return who(n, x, acts, face, **k)


HELD = {"p": "phoneHeld", "x": 0, "y": 0}


def shot(kind, action, set_=None, cast=None, props=None, **k):
    s = {"kind": kind, "action": action}
    if set_:
        s["set"] = set_
    if cast:
        s["cast"] = cast
    if props:
        s["props"] = props
    s.update(k)
    return s


def W(action, set_, cast=None, props=None, **k):
    return shot("wide", action, set_, cast, props, **k)


def M(action, set_, cast=None, props=None, **k):
    return shot("medium", action, set_, cast, props, **k)


def C(action, set_, cast=None, props=None, **k):
    return shot("close", action, set_, cast, props, **k)


def T(action, props, **k):
    return shot("top", action, None, None, props, **k)


def I(action, set_, props, **k):
    return shot("insert", action, set_, None, props, **k)


def D(action, props, **k):
    return shot("data", action, None, None, props, **k)


def tick(x=0, y=0):
    """A very small move so a held data shot still has a named change on its first frames."""
    return mv(0, 6, x=x, y=y)


def fact(text, x=960, y=170):
    return p("fact", x, y, text=text, moves=[mv(0, 4, y=y)])


def big(text, y=540, w=150, t2=None, c=None, x=960):
    d = p("big", x, y + 18, text=text, w=w, moves=[mv(0, 10, y=y)])
    if t2:
        d["t2"] = t2
    if c:
        d["c"] = c
    return d


def chapter(name, sub, hand):
    return [p("chapter", 960, 560, text=name, t2=sub, h=hand, moves=[mv(0, 12, y=540)])]


def counter(to, label=None, x=960, y=500, dec=0, pre="", suf="", w=760, n=26, c=None):
    d = p("counter", x, y, h=to, m=dec, t3=pre, t4=suf, w=w, n=n, moves=[mv(0, 4, y=y)])
    if label:
        d["t2"] = label
    if c:
        d["c"] = c
    return d


def phone(screen, x=960, y=540, s=1.0, t2=None, t3=None, n=None, r=0, shake=False, t4=None):
    d = p("phone", x, y, s=s, r=r, text=screen)
    if t2:
        d["t2"] = t2
    if t3:
        d["t3"] = t3
    if t4:
        d["t4"] = t4
    if n is not None:
        d["n"] = n
    d["moves"] = [mv(0, 10, y=y - 14)] if not shake else [mv(4, 3, x=x - 12), mv(7, 3, x=x + 12), mv(10, 3, x=x - 8), mv(13, 3, x=x)]
    return d


def hand(x=1300, y=900, r=-18, to=None, c="#2e6f92", s=1.0, curl=None, point=True):
    d = p("hand", x, y, r=r, s=s, c=c, point=point)
    if curl:
        d["curl"] = curl
        d["point"] = False
    d["moves"] = [mv(4, 8, **(to or {"x": x - 90, "y": y - 110}))]
    return d


Q = lambda x, y, s=0.7: p("qmark", x, y, s=s, moves=[mv(0, 8, y=y - 12)])
SCRIPT = []


def L(id_, text, shots, who_="narrator", after=None):
    item = {"id": id_, "who": who_, "text": text, "shots": shots}
    if after is not None:
        item["after"] = after
    SCRIPT.append(item)


def S(id_, secs, shots):
    SCRIPT.append({"id": id_, "silence": secs, "shots": shots})


SAD = dict(eyes="sad", brow="worry")

# ================================================================ HOOK
L("h1", "São nove e catorze da manhã.", [
    I("O ponteiro do relógio da sala chega às 9:14", "sala", [p("clock", 960, 540, s=2.6, h=9, m=13, moves=[mv(6, 8, m=14)])], cx=1200, sfx=[fx("click", 6, 0.5)]),
], after=0.2)
L("h2", "Você manda uma mensagem.", [
    T("O polegar toca o botão de enviar no celular em cima da mesa", [phone("chat", 900, 530, 1.0, r=-6), hand(1330, 1040, -24, {"x": 1100, "y": 770}), p("topMug", 1520, 240, s=0.9, moves=[mv(0, 40, r=4)])], motes=True, sfx=[fx("click", 12, 0.5)]),
], after=0.15)
L("h3", "Um risquinho. Só um.", [
    D("O risquinho único da mensagem aparece grande na tela", [phone("chat", 960, 560, 1.5, t3="Chego já, mãe")], focus=[1040, 500], z=1.5),
], after=0.2)
L("h4", "Você desliga o wi-fi e liga de novo. Nada.", [
    W("Caio estica o braço até o roteador na prateleira", "sala", [caio(1180, acts=[a("knock", 6), a("face", 8, eyes="half", brow="flat")], dir=1)], cx=1270, z=1.3),
    C("Caio olha para o roteador e pisca, sem resposta", "sala", [caio(acts=[a("lookUp", 4), a("snapFace", 24, eyes="half", brow="flat", mouth="flat")], face=F("dot"))], cx=1300),
], after=0.1)
L("h5", "Você olha pela janela. O vizinho tá fazendo a mesma coisa.", [
    W("Caio caminha até a janela da sala", "sala", [caio(860, walks=[{"from": 2, "to": 40, "x0": 0, "x1": -360}], face=F("dot", look=-0.5), dir=-1)], cx=620),
    I("Na janela da frente, uma silhueta sacode o celular no alto", "cidade", [p("big", 960, 540, text="", w=1)], cx=980) if False else
    M("Na janela da frente, o vizinho levanta o celular procurando sinal", "rua", [extra("gui", 1280, acts=[a("phoneUp", 6), a("wave", 24, n=1)], hold=HELD, y=880, face=F("wide", "o", brow="high"))], cx=1280, z=1.5),
    C("Caio franze a testa: é o mesmo problema", "sala", [caio(acts=[a("face", 6, eyes="wide", brow="high", mouth="o", look=0.3)], face=F("dot", "flat", look=0.3))], cx=500),
], after=0.21)
L("h6", "E se, de repente, a internet acabasse?", [
    D("A rede mundial de pontos acesos no globo começa a apagar", [p("globe", 960, 540, n=10, moves=[mv(0, 90, s=1.05)])], sfx=[fx("rumble", 4, 0.28, 96)]),
], after=0.2)
L("h7", "Não no seu bairro. No mundo inteiro. Tudo de uma vez.", [
    W("O céu sobre a cidade continua igual enquanto as janelas seguem acesas", "cidade", [], cx=1100, props=[p("aviao", 300, 200, s=0.4, moves=[mv(0, 200, x=1600, ease="linear")])]),
    D("Os últimos pontos do globo somem", [p("globe", 960, 540, n=0, s=1.12, moves=[mv(0, 60, s=1.2)])], focus=[960, 540]),
], after=0.28)
S("t0", 2.4, [
    D("O título acende sobre o escuro com o ponto de interrogação ao lado", [
        big("E SE, DE REPENTE...", 500, 170, c="#ffc857"),
        p("big", 960, 680, text="A INTERNET ACABASSE?", w=118, moves=[mv(0, 12, y=650)]),
        Q(1660, 300, 0.9),
    ], sfx=[fx("boom", 0, 0.3, 60)], trans="torn"),
])
L("r1", "Calma. Na vida real, isso é quase impossível.", [
    C("Caio solta o ar, aliviado", "rua", [caio(acts=[a("sigh", 4)], face=F("dot", "smile"))], cx=1000, props=[Q(1320, 300)]),
    D("Uma rede de nós pulsa sem nenhum centro", [p("rede", 960, 540, moves=[mv(0, 50, s=1.02)])]),
], after=0.1)
L("r2", "A internet não tem um botão de desligar. São mais de setenta mil redes independentes, ligadas umas nas outras.", [
    D("Um botão vermelho grande aparece riscado", [p("big", 960, 520, text="DESLIGAR", w=130, c="#e2553f", t2="esse botão não existe", moves=[mv(0, 8, y=500, r=-3)])]),
    D("A rede cresce e os nós se multiplicam", [p("rede", 960, 540, m=46, s=1.0, moves=[mv(0, 14, s=1.3)]), counter(70000, "REDES INDEPENDENTES", 960, 170, pre="+", w=720, n=30)], on="setenta"),
    D("Os pulsos atravessam as conexões", [p("rede", 960, 540, m=46, s=1.42, moves=[mv(0, 60, s=1.5)])], on="ligadas"),
], after=0.21)
L("r3", "Mas vamos fingir. A luz continua. Os cabos continuam. Só que, de repente, essas redes param de se entender.", [
    W("Caio acende e apaga a luz da sala: a luz funciona", "salaNoite", [caio(1900, acts=[a("knock", 6)])], cx=1760, z=1.25, on="fingir"),
    W("Um poste cheio de fios na rua, com tudo intacto", "rua", [extra("gal", 780, acts=[a("lookUp", 6)], face=F("dot", look=-0.4))], cx=620, z=1.2, on="cabos"),
    D("As conexões apagam uma a uma, sem nada quebrar", [p("rede", 960, 540, n=4, moves=[mv(0, 50, s=1.03)])], on="essas"),
], after=0.28)
L("c1", "Pra não ficar na teoria, vamos acompanhar três pessoas inventadas.", [
    W("Caio desce a rua empurrando a moto", "rua", [caio(900, walks=[{"from": 0, "to": 70, "x0": 0, "x1": 300}])], cx=1150, props=[p("moto", 1040, 880, moves=[mv(0, 70, x=1340, ease="linear")])]),
    C("Caio vira para a câmera e levanta a sobrancelha", "rua", [caio(acts=[a("turn", 6, to=0), a("face", 12, brow="high", mouth="smirk")], face=F("dot", look=0.5))], cx=1200, props=[Q(1340, 280, 0.8)], on="inventadas"),
], after=0.15)
L("c2", "Esse é o Caio. Vinte e seis anos, entregador de aplicativo, em Campinas.", [
    M("Caio põe o capacete embaixo do braço e acena", "rua", [caio(1120, acts=[a("raiseHand", 8, eyes="happy", mouth="smile")])], cx=1140, z=1.5, pill={"text": "CAIO, 26", "x": 1460, "y": 300, "at": 10, "to": [1200, 400]}),
    T("O celular do Caio no suporte, com o aplicativo de entregas aberto", [phone("load", 960, 520, 1.2, t2="ENTREGAS", t3="3 corridas hoje"), p("nota", 300, 260, s=0.8, r=14, text="20", moves=[mv(0, 40, r=16)]), p("topMug", 1600, 820, s=0.9)], on="entregador"),
], after=0.15)
L("c3", "A mãe dele, a dona Neide, tem um mercadinho a duas quadras de casa.", [
    W("Dona Neide empilha latas na prateleira do mercadinho", "mercado", [neide(1110, acts=[a("reach", 6), a("stand", 26)], dir=-1, face=F("happy", "smile"))], cx=860, z=1.2),
    W("Uma cliente entra e dona Neide acena do balcão", "mercado", [neide(1560, behind=True, acts=[a("raiseHand", 6, mouth="smile")], dir=-1), extra("gal2", 900, walks=[{"from": 0, "to": 34, "x0": 0, "x1": 180}])], cx=1320, on="mercadinho", pill={"text": "DONA NEIDE", "x": 1560, "y": 180, "at": 8, "to": [1560, 370]}),
], after=0.15)
L("c4", "Caio, leva o guarda-chuva!", [
    M("Dona Neide grita da porta apontando o céu", "rua", [neide(1160, acts=[a("point", 4, eyes="wide", brow="high")])], cx=1160, z=1.6),
], who_="neide", after=0.15)
L("c5", "E a vizinha, a Bia, é enfermeira.", [
    W("Bia atravessa a enfermaria com uma prancheta", "hospital", [bia(1080, walks=[{"from": 0, "to": 60, "x0": 0, "x1": 340}], hold=p("newspaper", 0, 0, s=0.34))], cx=1340, pill={"text": "BIA", "x": 1480, "y": 200, "at": 8, "to": [1420, 340]}),
], after=0.2)
L("c6", "Numa pesquisa de 2025, brasileiros disseram passar nove horas e treze minutos por dia conectados.", [
    M("Caio no sofá rola o celular sem levantar os olhos", "sala", [caio(600, acts=[a("sitPhone", 4), a("nod", 16)], face=F("half", lookY=0.9), hold=HELD)], cx=620, z=1.5),
    D("O contador sobe até 9 horas e 13 minutos", [p("big", 960, 560, text="9h13", w=280, c="#ffc857", t2="POR DIA, CONECTADOS (BAIN, 2025)", moves=[mv(0, 10, y=530)])], on="nove"),
], after=0.35)

# ================================================================ PRIMEIRO MINUTO
S("m0", 1.6, [D("O relógio do capítulo dá um pequeno passo", chapter("PRIMEIRO MINUTO", "9:14 DA MANHÃ", 6), sfx=[fx("click", 2, 0.5)], trans="torn")])
L("m1", "No primeiro minuto, não acontece nada.", [
    W("A rua segue normal: gente passa, ninguém olha pra cima", "rua", [extra("gui", 300, walks=[{"from": 0, "to": 70, "x0": 0, "x1": 420}]), extra("gal", 1800, walks=[{"from": 6, "to": 70, "x0": 0, "x1": -300}], dir=-1), caio(1140, acts=[a("checkPhone", 10)], hold=HELD, face=F("dot", lookY=0.9))], cx=1040),
], after=0.1)
L("m2", "A luz tá acesa. A bateria tá boa. O sinal tá ali, cheio.", [
    T("O dedo aponta as barrinhas cheias de sinal no celular", [phone("home", 900, 500, 1.3, n=999), hand(1380, 1000, -30, {"x": 1160, "y": 620})], focus=[880, 400], z=1.6),
    C("Caio observa a tela, satisfeito", "rua", [caio(acts=[a("lookDown", 4), a("snapFace", 26, mouth="smirk")], face=F("dot", lookY=0.6))], cx=800, on="sinal"),
], after=0.1)
L("m3", "Só que o aplicativo fica rodando, rodando.", [
    D("A bolinha do carregamento gira sem parar", [phone("load", 960, 540, 1.4, t2="ENTREGAS")], sfx=[fx("click", 18, 0.25)]),
    C("O rosto do Caio acompanha a bolinha", "rua", [caio(acts=[a("turn", 4, to=0.5), a("turn", 18, to=-0.5), a("turn", 34, to=0.3)], face=F("half", brow="flat", lookY=0.5))], cx=800, on="rodando"),
], after=0.1)
L("m4", "Ele faz o que todo mundo faz. Reinicia.", [
    W("Caio sacode o celular no ar", "rua", [caio(1140, acts=[a("phoneShake", 4), a("phoneUp", 18), a("phoneShake", 30)], hold=HELD, face=F("angry", "flat", brow="cross"))], cx=1100, z=1.4),
    T("A tela do celular fica preta e reinicia", [phone("off", 960, 500, 1.3, shake=True), p("nota", 1560, 860, s=0.9, r=-12, text="50", c="#6e8fb0")], on="Reinicia", sfx=[fx("ding", 6, 0.35)]),
], after=0.1)
L("m5", "Em outubro de 2021, Facebook, Instagram e WhatsApp saíram do ar por umas seis horas, no mundo todo.", [
    D("A placa de 2021 entra e três ícones sem marca se apagam", [fact("2021"), p("big", 960, 620, text="6 HORAS", w=210, t2="TRÊS APLICATIVOS FORA DO AR", moves=[mv(4, 10, y=590)])]),
    W("Pessoas numa praça olham os celulares, sem entender", "praca", [extra("gui", 700, acts=[a("checkPhone", 4)], hold=HELD, face=F("half", lookY=0.8)), extra("gal", 980, acts=[a("phoneUp", 10)], hold=HELD, face=F("wide", "o")), extra("gal2", 1320, acts=[a("shrug", 18)], face=F("dot", "frown"))], cx=1000, on="seis"),
], after=0.1)
L("m6", "Eram três bilhões e meio de pessoas nesses aplicativos.", [
    D("O contador sobe até 3,5 bilhões", [counter(3.5, "DE USUÁRIOS POR MÊS, EM 2021", 960, 500, dec=1, suf=" BILHÕES", w=1100, n=28)]),
], after=0.1)
L("m7", "Naquele dia, ainda sobrava o resto da internet pra reclamar.", [
    M("Caio sorri de canto, digitando reclamação", "sala", [caio(600, acts=[a("sitPhone", 4), a("snapFace", 24, eyes="happy", mouth="smile")], hold=HELD, face=F("half", "smirk", lookY=0.8))], cx=620, z=1.45),
], after=0.1)
L("m8", "Hoje, não sobrou nada.", [
    C("Caio olha fixo para o nada e o sorriso some", "salaNoite", [caio(acts=[a("snapFace", 8, eyes="dot", mouth="flat", brow="flat", look=0, lookY=0)], face=F("happy", "smile"))], cx=800, sfx=[fx("buzz", 8, 0.18, 30)]),
], after=0.32)

# ================================================================ PRIMEIRA HORA
S("o0", 1.6, [D("O ponteiro do relógio sobe até uma hora depois", chapter("PRIMEIRA HORA", "10:14", 90), sfx=[fx("click", 2, 0.5)], trans="torn")])
L("o1", "Na primeira hora, as pessoas param de culpar a operadora.", [
    W("Na porta da loja de conserto, três pessoas mostram o celular ao mesmo tempo", "rua", [extra("gui", 2280, acts=[a("give", 4)], hold=HELD, dir=1), extra("gal", 2500, acts=[a("give", 12)], hold=HELD, dir=-1), extra("guy2", 2640, acts=[a("handsHead", 22)], dir=-1, face=F("wide", "ah"))], cx=2400),
], after=0.1)
L("o2", "O Caio tá no meio de uma entrega. O mapa congelou.", [
    W("Caio pilota a moto pela rua, olhando para o suporte do celular", "rua", [caio(420, key={"pose": "ride"}, slide={"from": 0, "to": 80, "x0": 0, "x1": 620}, acts=[a("lookDown", 12)], face=F("dot", lookY=0.8))], cx=420, to=1040, props=[p("moto", 450, 880, moves=[mv(0, 80, x=1070, ease="linear")])], sfx=[fx("rumble", 0, 0.16, 60)]),
    D("O mapa no celular trava em 'reconectando'", [phone("mapa", 960, 540, 1.45)], on="mapa"),
], after=0.1)
L("o3", "Não tem nome do cliente. Não tem número do apartamento. Ele para, e faz uma coisa que não fazia há anos.", [
    C("Caio olha da tela para a rua, perdido", "rua", [caio(acts=[a("turn", 4, to=-0.6), a("turn", 22, to=0.6)], face=F("wide", "wave", brow="worry", look=0))], cx=1700),
    D("O pacote com a etiqueta em branco", [p("big", 960, 540, text="APTO ???", w=170, t2="CLIENTE: ???", c="#e2553f", moves=[mv(0, 8, r=-2, y=530)])], on="número"),
    W("Caio para a moto e desce devagar", "rua", [caio(1420, acts=[a("stand", 6), a("lookUp", 24)], face=F("dot", look=0.3))], cx=1500, z=1.3, on="para", props=[p("moto", 1260, 880)]),
], after=0.1)
L("o4", "Pergunta pra uma pessoa.", [
    M("Caio bate palmas no portão e chama", "ruaFechada", [caio(1540, acts=[a("knock", 4), a("stand", 14), a("knock", 22)], face=F("dot", "ah")), extra("gal2", 1790, acts=[a("turn", 20, to=-0.5)], dir=-1, face=F("dot"))], cx=1660, z=1.6, sfx=[fx("knock", 4, 0.4), fx("knock", 22, 0.4)]),
], after=0.21)
L("o5", "No mercadinho, uma cliente tenta pagar com Pix.", [
    W("A cliente levanta o celular para o balcão", "mercado", [neide(1570, behind=True, face=F("dot", "smile"), dir=-1), extra("gal2", 1280, acts=[a("give", 6)], hold=HELD, dir=1)], cx=1400, z=1.3),
    T("A tela do Pix gira e dá erro", [phone("pix", 960, 500, 1.25, n=28), p("peca", 300, 240, c="#d9b23a", w=180, h=120, r=12) if False else p("nota", 300, 240, s=0.7, r=12, text="10", c="#a15f6c"), p("topMug", 1600, 240)], on="Pix", sfx=[fx("buzz", 28, 0.22, 20)]),
], after=0.15)
L("o6", "Foi?", [C("Dona Neide pergunta, por cima dos óculos", "mercado", [neide(acts=[a("face", 4, brow="high", look=0.4)], face=F("dot", "flat", look=0.4))], cx=1500)], who_="neide", after=0.05)
L("o7", "Não foi.", [C("A cliente mostra a tela, sem graça", "mercado", [who("cliente", acts=[a("flinch", 3, eyes="sad", brow="worry", mouth="flat")], face=F("dot", look=-0.4))], cx=1300)], who_="cliente", after=0.25)
L("o8", "Em dezembro de 2025, o Brasil fez trezentos e treze milhões de Pix num único dia.", [
    D("O contador de Pix corre até 313 milhões", [counter(313, "DE PIX EM UM SÓ DIA (DEZ. 2025)", 960, 500, suf=" MILHÕES", w=1120, n=34)], motes=True),
    W("Filas de gente no centro, todos com o celular na mão", "rua", [extra(n, x, acts=[a("checkPhone", i * 6 + 2)], hold=HELD, face=F("half", lookY=0.8)) for i, (n, x) in enumerate([("gui", 560), ("gal", 760), ("guy2", 960), ("gal2", 1160), ("gui", 1360)])], cx=960, on="milhões"),
], after=0.1)
L("o9", "Entre os bancos, ele roda numa rede própria. Mas o aplicativo, no seu celular, chega ao banco pela internet.", [
    D("Dois prédios de banco ligados por um cabo que continua aceso", [p("rede", 960, 540, m=10, s=1.2, moves=[mv(0, 60, s=1.26)]), p("big", 960, 190, text="ENTRE BANCOS: REDE PRÓPRIA", w=70, c="#ffc857", moves=[mv(0, 6, y=175)])]),
    D("A ligação entre o celular e o banco se corta", [phone("erro", 480, 540, 1.1, t2="SEM INTERNET", t3="Pix indisponível"), p("big", 1300, 560, text="✕", w=320, c="#e2553f", moves=[mv(0, 4, y=530, r=4)]), p("big", 1300, 780, text="CELULAR ATÉ O BANCO", w=56)], on="aplicativo"),
], after=0.15)
L("o10", "A maquininha também desiste.", [
    I("A maquininha mostra falha na conexão", "mercado", [p("maquininha", 960, 560, s=1.7, n=16)], cx=1500, sfx=[fx("buzz", 16, 0.22, 20)]),
], after=0.1)
L("o11", "Em 2022, a falha de uma única operadora no Canadá atingiu mais de doze milhões de clientes e derrubou o débito no país inteiro.", [
    D("A placa de 2022 entra sobre o contador de 12 milhões", [fact("2022"), counter(12, "DE CLIENTES SEM REDE, CANADÁ", 960, 620, pre="+", suf=" MILHÕES", w=1040, n=28)]),
    W("Num caixa, a fila cresce e uma pessoa levanta o cartão", "mercado", [neide(1570, behind=True, acts=[a("shrug", 6)], dir=-1, face=F("dot", "frown")), extra("gui", 1310, acts=[a("give", 8)]), extra("gal", 1140), extra("guy2", 970), extra("gal2", 800)], cx=1200, on="clientes"),
    D("Um cartão de débito balança, sem funcionar", [p("maquininha", 560, 560, s=1.4, n=2), p("big", 1270, 560, text="DÉBITO", w=170, t2="FORA DO AR", c="#e2553f", moves=[mv(4, 6, y=530)])], on="débito"),
], after=0.1)
L("o12", "Em vários lugares, nem o número de emergência atendia.", [
    D("O número de emergência chama sem ninguém atender", [p("big", 960, 500, text="911", w=260, c="#c4ced3", moves=[mv(0, 8, y=480)]), p("big", 960, 700, text="NO CANADÁ, A EMERGÊNCIA TAMBÉM FALHOU", w=62, c="#e2553f", moves=[mv(6, 8, y=680)])], sfx=[fx("siren", 0, 0.08, 42)]),
], after=0.25)
L("o13", "No hospital da Bia, a tela do prontuário tá parada.", [
    W("Bia digita no monitor e nada muda", "hospital", [bia(1830, behind=True, acts=[a("deskReady", 4), a("face", 20, brow="flat", mouth="flat")], dir=1, face=F("dot"))], cx=1900, z=1.3),
    C("Bia morde o lábio e olha para o lado", "hospital", [bia(acts=[a("turn", 8, to=-0.5, eyes="half", brow="worry")], face=F("dot", "flat"))], cx=1900),
], after=0.1)
L("o14", "Em 2024, uma atualização com defeito travou oito milhões e meio de computadores. Menos de um por cento dos Windows do mundo.", [
    D("A placa de 2024 e a tela de erro azul", [fact("2024"), counter(8.5, "DE COMPUTADORES TRAVADOS", 960, 560, dec=1, suf=" MILHÕES", w=1040, n=26)]),
    D("Uma barra enche só um pedacinho", [p("big", 960, 440, text="MENOS DE 1%", w=170, c="#ffc857", moves=[mv(0, 8, y=420)]), p("big", 960, 640, text="DOS WINDOWS DO MUNDO", w=70)], on="Menos"),
], after=0.1)
L("o15", "E já foi o bastante pra cancelar milhares de voos e mandar hospitais de volta pro papel.", [
    W("O avião fica parado sob o céu da cidade", "cidade", [], cx=1000, props=[p("aviao", 960, 620, s=1.0, moves=[mv(0, 100, s=1.04)])]),
    T("A mão de Bia preenche uma ficha de papel com caneta", [p("caderno", 960, 520, s=0.95, t2="PACIENTES", lines=["Leito 3: pressão 12/8", "Leito 5: febre, 38 °C", "Leito 7: medicação 14h"], n=4), hand(1420, 900, -30, {"x": 1270, "y": 700}, c="#4f9a8e")], on="hospitais"),
], after=0.1)
L("o16", "E tem o que você nem lembrava que era internet.", [
    C("Caio coça a cabeça, lembrando de algo", "salaNoite", [caio(acts=[a("listen", 6), a("face", 14, look=-0.5, lookY=-0.6, brow="high")], face=F("dot"))], cx=620, props=[Q(1350, 270)]),
], after=0.1)
L("o17", "Em outubro de 2025, uma falha num provedor de nuvem deixou donos de camas inteligentes com o colchão preso no calor.", [
    D("A placa de 2025 e o colchão esquenta", [fact("OUT. 2025"), p("cama", 960, 860, s=1.15, moves=[mv(0, 80, s=1.17)])]),
    M("Um homem de pijama, suando, sentado na beirada da cama", "salaNoite", [extra("guy2", 960, acts=[a("sitOnly", 2), a("sigh", 10)], face=F("half", "wave", brow="worry"))], cx=980, z=1.5, on="donos"),
], after=0.15)
L("o18", "A cama.", [
    C("Caio fica olhando, sem acreditar", "salaNoite", [caio(acts=[a("snapFace", 10, eyes="wide", brow="high", mouth="flat")], face=F("dot"))], cx=620),
], after=0.35)

# ================================================================ PRIMEIRO DIA
S("d0", 1.6, [D("O relógio chega à noite do primeiro dia", chapter("PRIMEIRO DIA", "21:00", 270), sfx=[fx("click", 2, 0.5)], trans="torn")])
L("d1", "No fim do primeiro dia, a ficha cai. Ninguém sabe o tamanho da coisa, porque a internet era o jeito de descobrir.", [
    W("O céu escurece sobre a cidade e janelas se acendem", "cidadeNoite", [], cx=1100),
    C("Caio, sentado, sem ter o que rolar", "salaNoite", [caio(acts=[a("face", 8, eyes="half", brow="worry", mouth="flat", look=-0.4)], face=F("dot"))], cx=500, on="ficha"),
    D("Um ponto de interrogação cresce sobre o globo", [p("globe", 960, 540, n=0, s=0.9), Q(960, 500, 1.6)], on="porque"),
], after=0.2)
L("d2", "Em abril de 2025, um apagão parou Espanha e Portugal. Rádios a pilha sumiram das prateleiras.", [
    D("A placa de abril de 2025 e o mapa da península escurece", [fact("ABR. 2025"), p("big", 960, 600, text="ESPANHA E PORTUGAL", w=120, t2="APAGÃO", moves=[mv(0, 10, y=570)])]),
    I("Um rádio a pilha some da prateleira", "mercado", [p("radio", 960, 620, s=1.8, n=999, moves=[mv(6, 10, y=1300, r=8, ease="in")])], cx=700, on="Rádios"),
], after=0.1)
L("d3", "E estranhos dividiam notícia na calçada.", [
    W("Vizinhos conversam em roda na calçada", "ruaNoite", [extra("gui", 840, acts=[a("point", 8)], dir=1, face=F("dot", "ah")), extra("gal", 1080, dir=-1, acts=[a("nod", 14)], face=F("dot", "o")), extra("guy2", 1290, dir=-1, acts=[a("armsFold", 22)], face=F("half"))], cx=1060),
], after=0.2)
L("d4", "O Caio acha no armário o rádio velho do avô.", [
    W("Caio tira o rádio de cima da estante", "salaNoite", [caio(1590, acts=[a("reach", 4), a("carry", 26)], dir=1, face=F("wide", "smile", brow="high"))], cx=1640, z=1.4, props=[p("radio", 1830, 460, s=0.5, moves=[mv(26, 10, x=1720, y=590)])]),
    T("A mão gira o botão do rádio e o ponteiro se move", [p("radio", 960, 560, s=2.0, n=14), hand(1440, 1040, -24, {"x": 1290, "y": 800})], on="rádio", sfx=[fx("click", 8, 0.45)]),
], after=0.2)
L("d5", "No centro, provavelmente tem fila em todo caixa eletrônico que ainda funciona.", [
    W("Uma fila longa diante do banco", "rua", [extra(n, x, acts=[a("checkPhone", (i * 5) % 19)], hold=HELD, dir=1, face=F("half")) for i, (n, x) in enumerate([("gui", 900), ("gal", 1050), ("guy2", 1200), ("gal2", 1350), ("gui", 1500)])] + [caio(1640, acts=[a("handsHead", 18)], dir=1, face=F("sad", "frown", brow="worry"))], cx=1400, props=[p("atm", 1800, 880, layer="back", s=1.05)]),
    I("A tela do caixa eletrônico apaga para 'fora de serviço'", "rua", [p("atm", 960, 1000, s=1.9, n=1, moves=[mv(0, 40, s=1.95)])], cx=1800, on="caixa", sfx=[fx("buzz", 6, 0.22, 16)]),
], after=0.1)
L("d6", "Em 2021, um ataque a um fornecedor de software fechou quase oitocentos supermercados na Suécia.", [
    D("A placa de 2021 e o contador de 800 lojas", [fact("2021"), counter(800, "SUPERMERCADOS FECHADOS NA SUÉCIA", 960, 580, pre="~", w=1100, n=26)]),
    W("Uma porta de ferro desce numa loja", "ruaFechada", [extra("gal", 1650, walks=[{"from": 8, "to": 50, "x0": 0, "x1": 240}], face=F("dot", "frown"))], cx=1780, on="fechou", props=[p("big", 1810, 590, text="FECHADO", w=110, c="#ffdd8a", moves=[mv(6, 6, r=-4)])], sfx=[fx("rumble", 4, 0.2, 40)]),
], after=0.1)
L("d7", "Os caixas simplesmente não funcionavam. Tinha comida na prateleira, e ninguém conseguia vender.", [
    W("Prateleiras cheias, ninguém no caixa", "mercado", [extra("gal2", 500, acts=[a("reach", 6), a("stand", 24)], dir=-1)], cx=720),
    M("Dona Neide cruza os braços atrás do balcão e olha a registradora", "mercado", [neide(1610, behind=True, acts=[a("armsFold", 8), a("turn", 18, to=0.5)], face=F("half", brow="flat"))], cx=1660, z=1.6, on="comida"),
], after=0.15)
L("d8", "A dona Neide não fecha. Ela abre um caderno.", [
    C("Dona Neide decide, olhos estreitos", "mercado", [neide(acts=[a("snapFace", 8, eyes="angry", brow="cross", mouth="smirk")], face=F("dot"))], cx=1600),
    T("A mão abre o caderno de fiado sobre o balcão", [p("caderno", 960, 540, s=0.95, n=999, t2="FIADO", moves=[mv(0, 8, y=520)]), hand(1500, 1040, -26, {"x": 1340, "y": 860}, c="#7a3f4a"), p("nota", 300, 860, s=0.9, r=-10, text="20")], on="abre", sfx=[fx("knock", 4, 0.2)]),
], after=0.1)
L("d9", "Fiado, né? Mas eu anoto tudo.", [
    M("Dona Neide aponta a caneta para a placa de fiado", "mercado", [neide(2030, acts=[a("point", 6, mouth="smirk", eyes="happy")], dir=1)], cx=2220, z=1.35),
], who_="neide", after=0.1)
L("d10", "O mercadinho tem uma tecnologia que o supermercado grande não tem: ela sabe o nome de todo mundo.", [
    T("O nome das pessoas vai surgindo escrito no caderno", [p("caderno", 960, 530, s=0.95), hand(1420, 960, -26, {"x": 1290, "y": 780}, c="#7a3f4a")], z=1.25),
    W("Clientes conversam com dona Neide e levam sacolas", "mercado", [neide(1570, behind=True, acts=[a("give", 8)], dir=-1, face=F("happy", "smile")), extra("gui", 1300, acts=[a("nod", 20)], face=F("dot", "smile")), extra("gal", 1090, walks=[{"from": 4, "to": 40, "x0": 0, "x1": -320}], dir=-1, face=F("dot", "smile"))], cx=1300, on="nome"),
], after=0.1)
L("d11", "No mundo, dá pra imaginar bolsas suspensas, voos cancelados, empresas fechando as portas.", [
    D("Um gráfico da bolsa para de se mexer", [p("big", 960, 500, text="NEGOCIAÇÃO SUSPENSA", w=118, c="#e2553f", t2="provavelmente", moves=[mv(0, 8, y=480)])]),
    W("Avião parado e o céu vazio à tarde", "cidade", [], cx=1400, props=[p("aviao", 1400, 700, s=0.7, moves=[mv(0, 50, r=-0.6)])], on="voos"),
    W("Empregados saem de um prédio em fila, sem pressa", "rua", [extra(n, x, walks=[{"from": i * 4, "to": 70, "x0": 0, "x1": 280}]) for i, (n, x) in enumerate([("gui", 1100), ("gal", 960), ("guy2", 810), ("gal2", 670)])], cx=1180, on="empresas"),
], after=0.25)
L("d12", "De noite, a rua tá cheia. Gente na calçada, perguntando. Ninguém tem nada pra rolar.", [
    W("Toda a calçada iluminada, com vizinhos em cadeiras", "ruaNoite", [extra("gui", 340, acts=[a("sitOnly", 2)], face=F("dot", "smile")), extra("gal", 620, acts=[a("nod", 12)], face=F("dot", "ah")), caio(980, acts=[a("listen", 10)], face=F("dot"), hold=p("radio", 40, -40, s=0.28)), extra("gal2", 1260, acts=[a("point", 24)], face=F("dot", "o"), dir=-1), extra("guy2", 1500, dir=-1, face=F("half"), acts=[a("armsFold", 8)])], cx=920),
    C("Uma senhora ri alto no escuro", "ruaNoite", [who("gal", acts=[a("snapFace", 8, eyes="happy", mouth="ah")], face=F("dot", "smile"))], cx=1400, on="perguntando"),
    M("Caio escuta o rádio, cercado de gente", "ruaNoite", [caio(1040, acts=[a("listen", 4), a("nod", 22)], face=F("half"), hold=p("radio", 40, -40, s=0.28)), extra("gui", 840, face=F("dot", "o"), acts=[a("lean", 12)], dir=1), extra("gal", 1250, dir=-1, face=F("dot", "o"), acts=[a("lean", 18)])], cx=1040, z=1.6, on="nada"),
], after=0.35)

# ================================================================ PRIMEIRA SEMANA
S("s0", 1.6, [D("As folhas do calendário passam até o sétimo dia", chapter("PRIMEIRA SEMANA", "DIA 7", 720), sfx=[fx("whoosh", 2, 0.22)], trans="torn")])
L("s1", "E aqui começa a parte séria.", [
    W("O mercadinho amanhece com menos coisas na prateleira", "mercadoVazio", [neide(1110, acts=[a("reach", 6), a("lookUp", 24)], dir=-1, face=F("half", brow="worry"))], cx=860, z=1.15),
], after=0.1)
L("s2", "Hoje, muita loja faz pedido pelo sistema. O caminhão recebe a rota pelo sistema.", [
    D("Uma linha de pedidos passa da loja ao armazém", [p("rede", 960, 540, m=14, s=1.05, moves=[mv(0, 40, s=1.1)]), p("big", 960, 200, text="PEDIDO: ERRO DE REDE", w=80, c="#e2553f", moves=[mv(0, 6, y=180)])]),
    W("Um caminhão espera parado na rua, motorista olhando o celular", "ruaFechada", [extra("guy2", 1260, acts=[a("phoneUp", 6)], hold=HELD, face=F("half", "frown"), dir=1)], cx=880, z=1.05, on="caminhão", props=[p("truck", 780, 900, moves=[mv(0, 90, x=786)])]),
], after=0.1)
L("s3", "Em 2018, a greve dos caminhoneiros durou cerca de dez dias. Faltou combustível. Faltou comida fresca.", [
    D("A placa de 2018 e dez folhas de calendário", [fact("2018"), counter(10, "DIAS DE GREVE", 960, 560, pre="~", w=560, n=20)]),
    W("Uma fila enorme de motos e pessoas com galões", "rua", [caio(1020, acts=[a("carry", 6)], face=F("half", "frown"), walks=[{"from": 4, "to": 44, "x0": 0, "x1": 140}]), extra("gui", 800, acts=[a("handsHead", 14)]), extra("gal", 610, face=F("dot", "frown"))], cx=900, on="Faltou"),
    I("Uma caixa de frutas vazia sobre o balcão", "mercadoVazio", [p("big", 960, 540, text="ACABOU", w=210, c="#ffc857", t2="volta sem data", moves=[mv(4, 6, r=-3, y=520)])], cx=500, on="comida"),
], after=0.1)
L("s4", "Ali, os sistemas funcionavam. O que faltava era caminhão.", [
    M("Um motorista olha para a estrada, de braços cruzados", "ruaFechada", [extra("guy2", 1200, acts=[a("armsFold", 8)], face=F("half", brow="flat"))], cx=1160, z=1.5),
], after=0.1)
L("s5", "Agora, provavelmente seria o contrário: tem caminhão, mas ninguém sabe quem precisa de quê.", [
    W("O caminhão cruza a rua vazia à procura", "ruaFechada", [], cx=940, to=1440, props=[p("truck", 500, 900, moves=[mv(0, 120, x=2100, ease="linear")])], sfx=[fx("rumble", 0, 0.16, 60)]),
    T("Um dedo passa por uma lista de pedidos em papel, cheia de rasuras", [p("caderno", 960, 530, s=0.95, t2="PEDIDOS", lines=["Arroz: ?", "Feijão: ?", "Café: 20 cx?", "Quem pediu?"], n=2), hand(1460, 980, -24, {"x": 1270, "y": 720})], on="ninguém"),
], after=0.1)
L("s6", "Não é fim do mundo. É lentidão. Telefone, papel, e gente indo até lá.", [
    C("Dona Neide fala ao telefone fixo do mercadinho, com caneta em punho", "mercadoVazio", [neide(acts=[a("phoneEar", 6), a("nod", 26)], face=F("dot", "flat", look=0.4))], cx=1660),
    T("O bilhete de pedido sendo dobrado", [p("bilhete", 900, 520, s=1.4, lines=["Dona Neide pede:", "arroz, feijão, café.", "Pago na volta!"], moves=[mv(8, 8, r=-6, s=1.34)]), hand(1420, 980, -30, {"x": 1270, "y": 780}, c="#2e6f92")], on="papel"),
], after=0.21)
L("s7", "O aplicativo do Caio morreu. Sem aplicativo, sem corrida. Sem corrida, sem dinheiro.", [
    D("O ícone de entregas apaga na tela", [phone("erro", 960, 540, 1.4, t2="SEM CORRIDAS")]),
    C("Caio esvazia o bolso: só umas moedas", "sala", [caio(acts=[a("lookDown", 4), a("sigh", 14)], face=F("half", "frown", brow="worry"))], cx=900, on="corrida"),
    T("Duas notas sobre a mesa e nenhuma outra", [p("nota", 830, 540, s=1.25, r=-8, text="10", c="#a15f6c", moves=[mv(4, 8, r=-5)]), p("nota", 1160, 590, s=1.25, r=8, text="5", c="#6e8fb0")], on="dinheiro", motes=True),
], after=0.1)
L("s8", "Só que ele tem uma moto. E na primeira semana, uma moto vale ouro.", [
    W("Caio olha a moto parada na calçada, ideia chegando", "rua", [caio(800, acts=[a("turn", 6, to=0.6), a("snapFace", 22, eyes="wide", brow="high", mouth="smirk")], face=F("half"))], cx=960, z=1.3, props=[p("moto", 1060, 880)]),
    C("Caio sorri e a interrogação acende", "rua", [caio(acts=[a("snapFace", 4, eyes="happy", mouth="smile", look=0.2)], face=F("dot"))], cx=1100, props=[p("qmark", 1340, 270, s=0.8, o=0, moves=[mv(4, 6, o=1)])], on="ouro", sfx=[fx("ding", 4, 0.28)]),
], after=0.1)
L("s9", "Ele começa a levar bilhete. Remédio. Recado de um bairro pro outro.", [
    W("Caio passa de moto com o baú cheio", "rua", [caio(1520, key={"pose": "ride"}, slide={"from": 0, "to": 80, "x0": 0, "x1": 700}, face=F("dot", "smile"))], cx=1500, to=2150, props=[p("moto", 1550, 880, moves=[mv(0, 80, x=2250, ease="linear")])], sfx=[fx("rumble", 0, 0.16, 60)]),
    T("A mão pega um bilhete dobrado de outra mão", [p("bilhete", 960, 480, s=1.15, r=-6, lines=["Mãe: tô bem.", "Chego sábado."], moves=[mv(4, 14, x=1100, y=620)]), hand(420, 1000, 20, {"x": 560, "y": 760}, c="#6e6058"), hand(1560, 1040, -26, {"x": 1360, "y": 880})], on="Remédio"),
    M("Uma senhora abre o portão e recebe uma sacola da farmácia", "rua", [caio(760, acts=[a("give", 4)], hold=p("bucket", 0, 30, s=0.6, until=30)), extra("gal2", 980, dir=-1, acts=[a("handToMouth", 14)], face=F("happy", "smile"))], cx=880, z=1.5, on="Recado"),
], after=0.1)
L("s10", "Cinco reais por bilhete.", [
    D("O preço surge rabiscado no escuro", [p("big", 960, 540, text="R$ 5", w=320, c="#ffc857", t2="POR BILHETE", moves=[mv(0, 6, r=-4, y=520)])], sfx=[fx("ding", 2, 0.25)]),
], after=0.1)
L("s11", "O Caio virou a internet.", [
    C("Caio, de capacete torto, satisfeito", "rua", [caio(acts=[a("nod", 6), a("snapFace", 18, eyes="happy", mouth="smile")], face=F("dot", "smirk"))], cx=1600, props=[Q(1340, 270)]),
], after=0.28)
L("s12", "Agora, a escala. Em 2011, o Egito desligou a internet por cinco dias. A Ó Cê Dê É estimou uns noventa milhões de dólares de prejuízo.", [
    D("O globo gira lentamente até o Egito", [p("globe", 960, 540, s=1.0, moves=[mv(0, 50, x=900)])]),
    D("A placa de 2011 e o contador de dinheiro", [fact("2011"), counter(90, "DE DÓLARES, 5 DIAS, EGITO (OCDE)", 960, 580, pre="US$ ", suf=" MILHÕES", w=1180, n=30)], on="Egito"),
    D("Um número fica muito menor do que o globo inteiro", [p("big", 960, 540, text="UM PAÍS SÓ.", w=170, t2="estimativa preliminar", moves=[mv(4, 8, y=520)])], on="prejuízo"),
], after=0.1)
L("s13", "Um país só. Quinze anos atrás.", [
    W("O céu da cidade cheio de janelas, olhando de longe", "cidade", [], cx=1500, to=1560),
], after=0.2)
L("s14", "Em 2022, um vulcão rompeu os cabos submarinos de Tonga. O país ficou trinta e oito dias sem a conexão normal.", [
    D("O vulcão explode e rompe o cabo no fundo do mar", [p("vulcao", 960, 660, s=0.78, moves=[mv(0, 40, s=0.8)])], sfx=[fx("boom", 6, 0.35, 48)]),
    D("A placa de 2022 e 38 dias", [fact("2022"), counter(38, "DIAS SEM CONEXÃO NORMAL, TONGA", 960, 580, w=1000, n=24)], on="trinta"),
], after=0.1)
L("s15", "Caixas eletrônicos pararam. Os bancos não conseguiam ver o saldo dos clientes.", [
    I("O caixa eletrônico piscando fora de serviço", "ruaFechada", [p("atm", 960, 1000, s=1.9, n=1, moves=[mv(0, 40, s=1.96)])], cx=1800),
    M("Uma funcionária de banco abre as mãos para uma fila", "ruaFechada", [extra("gal", 1500, acts=[a("shrug", 6)], dir=1, face=F("dot", "frown", brow="worry")), extra("gui", 1740, acts=[a("handsHead", 16)], dir=-1), extra("guy2", 1950, dir=-1, face=F("half"))], cx=1700, z=1.45, on="saldo"),
], after=0.35)

# ================================================================ PRIMEIRO MES
S("e0", 1.6, [D("O ponteiro dá muitas voltas até o primeiro mês", chapter("PRIMEIRO MÊS", "DIA 30", 1080), sfx=[fx("whoosh", 2, 0.22)], trans="torn")])
L("e1", "No primeiro mês, o susto vira rotina.", [
    W("Manhã na praça: gente passa devagar com sacolas", "praca", [extra("gui", 480, walks=[{"from": 0, "to": 70, "x0": 0, "x1": 360}]), extra("gal2", 1500, walks=[{"from": 6, "to": 70, "x0": 0, "x1": -280}], dir=-1)], cx=1000),
], after=0.1)
L("e2", "Na praça, surge um mural. Procura-se. Vende-se. Aula de violão na garagem.", [
    M("Caio prega um papel no mural", "praca", [caio(780, acts=[a("knock", 4)], dir=1)], cx=960, z=1.3, props=[p("mural", 1190, 610, s=0.8, n=3)], sfx=[fx("knock", 6, 0.3)]),
    I("Os papéis vão enchendo o mural", "praca", [p("mural", 960, 610, s=0.98)], cx=1150, on="Procura-se"),
    W("Vizinhos param e leem o mural de perto", "praca", [extra("gal", 760, acts=[a("handToMouth", 4)], dir=1), extra("gui", 560, acts=[a("lean", 10)], dir=1), extra("gal2", 1520, acts=[a("point", 18)], dir=-1, face=F("dot", "smile"))], cx=1050, props=[p("mural", 1130, 620, s=0.62, layer="back")], on="garagem"),
], after=0.15)
L("e3", "Os bancos voltam a atender no balcão. Governos provavelmente ligam primeiro as redes privadas.", [
    W("A fila anda no banco de portas abertas, com uma atendente", "rua", [extra("gal", 1800, acts=[a("writing", 4)], dir=-1), extra("gui", 1590, acts=[a("give", 8)]), extra("guy2", 1420), caio(1270, acts=[a("nod", 20)], face=F("dot"))], cx=1560),
    D("Um pequeno grupo de nós volta a acender", [p("rede", 960, 540, m=6, s=1.4, moves=[mv(0, 20, s=1.5)]), p("big", 960, 170, text="SÓ REDES PRIVADAS", w=80, c="#ffc857", t2="provavelmente", moves=[mv(0, 6, y=150)])], on="provavelmente"),
], after=0.2)
L("e4", "Tem um lado bom? Talvez. Em 2025, um estudo bloqueou a internet do celular de centenas de pessoas por duas semanas.", [
    C("Caio coça o queixo, pensando", "praca", [caio(acts=[a("face", 6, look=0.6, lookY=-0.4, brow="high"), a("nod", 24)], face=F("dot"))], cx=800, props=[Q(1340, 270)]),
    D("A placa de 2025 entra com a palavra estudo", [fact("2025"), p("big", 960, 620, text="2 SEMANAS", w=210, t2="SEM INTERNET NO CELULAR", moves=[mv(4, 8, y=590)])], on="estudo"),
], after=0.1)
L("e5", "O tempo de tela caiu quase pela metade. A atenção e o humor melhoraram.", [
    D("As barras caem de 314 para 161 minutos", [p("bars", 960, 800, h=314, m=161)]),
    W("Caio lê um livro no banco da praça", "pracaTarde", [caio(590, acts=[a("sitRead", 4), a("face", 14, eyes="half", mouth="smile")], hold=p("newspaper", 8, 10, s=0.34), dir=1)], cx=720, z=1.35, on="atenção"),
], after=0.1)
L("e6", "Mas foi uma escolha. E muita gente nem conseguiu ir até o fim.", [
    M("Uma pessoa pega o celular escondido, e devolve", "pracaTarde", [extra("gui", 980, acts=[a("checkPhone", 6), a("stand", 30)], hold=HELD, face=F("half", "wave"))], cx=980, z=1.6),
], after=0.32)
L("e7", "E o que ninguém escolheu?", [
    S if False else C("Dona Neide para com a caneta no ar, olhando para o porta-retrato", "salaNoite", [neide(acts=[a("lookDown", 8), a("face", 26, **SAD)], face=F("dot"))], cx=1100),
], after=0.49)
L("e8", "A irmã do Caio, a Lena, mora em Lisboa.", [
    I("Um porta-retrato na parede: as duas, abraçadas", "salaNoite", [p("big", 960, 540, text="LENA", w=210, c="#f3ead6", t2="LISBOA", moves=[mv(4, 12, y=520)])], cx=950),
], after=0.21)
L("e9", "Todo domingo, vídeo. Mãe e filha. De graça.", [
    T("O celular apoiado na lata de açúcar mostra o rosto da Lena", [phone("call", 960, 500, 1.2, t4="11:02"), p("topMug", 1500, 720, s=0.9), hand(390, 1060, 22, {"x": 500, "y": 900}, c="#7a3f4a")], motes=True),
    C("Dona Neide sorri, lembrando", "salaNoite", [neide(acts=[a("snapFace", 6, eyes="happy", mouth="smile")], face=F("dot"))], cx=500, on="Mãe"),
], after=0.35)
L("e10", "Quase todo o tráfego internacional passa por cabos no fundo do mar. Sem ele, Lisboa fica muito longe.", [
    D("O cabo atravessa o oceano escuro", [p("vulcao", 960, 40, s=1.05, moves=[mv(0, 30, y=20)]) if False else p("globe", 960, 540, s=1.0, n=0, moves=[mv(0, 80, s=1.08)])]),
    D("A palavra Lisboa fica pequena no escuro", [p("big", 960, 540, text="LISBOA", w=170, c="#c4ced3", s=1.0, moves=[mv(4, 90, s=0.45)])], on="Lisboa"),
], after=0.32)
L("e11", "Em Tonga, muita gente teve que pegar a estrada, ou o barco, pra descobrir qualquer coisa.", [
    W("Alguém olha o mar de longe, parado", "pracaTarde", [extra("gal2", 1520, acts=[a("lookUp", 8), a("sigh", 34)], dir=1, face=F("half", **{"brow": "worry"}))], cx=1600, z=1.25),
], after=0.42)
S("e12", 1.5, [
    M("Dona Neide senta à mesa com uma folha em branco", "salaNoite", [neide(1100, acts=[a("sitDesk", 8), a("face", 20, **SAD)], face=F("dot", lookY=0.7), wallShadow=True)], cx=1100, z=1.5),
])
L("e13", "A dona Neide escreve uma carta. A primeira desde 1994.", [
    T("A mão dela escreve devagar", [p("carta", 960, 560, s=0.86, n=3, lines=["Filha,"]), hand(1420, 1000, -26, {"x": 1240, "y": 680}, c="#7a3f4a")], motes=True),
], after=0.28)
L("e14", "Filha, aqui tá todo mundo bem. Me escreve.", [
    T("As palavras vão surgindo no papel", [p("carta", 960, 560, s=0.86, n=0, lines=["Filha,", "aqui tá todo mundo bem.", "Me escreve."]), hand(1520, 1040, -26, {"x": 1400, "y": 880}, c="#7a3f4a")], focus=[960, 440], z=1.3),
], who_="neide", after=0.56)
S("e15", 1.8, [
    W("Caio coloca o envelope na caixa de correio", "pracaTarde", [caio(1180, acts=[a("give", 8), a("stand", 32)], face=F("half", brow="worry"), dir=1)], cx=1280, z=1.45, props=[p("caixaCorreio", 1480, 880, s=1.0, layer="back"), p("envelope", 1400, 620, s=0.26, moves=[mv(22, 8, x=1480, y=610, o=0)])]),
])
L("e16", "A carta vai por navio ou avião, quando tiver. Pode levar semanas.", [
    W("O avião some ao longe, pequeno", "cidadeNoite", [], cx=900, props=[p("aviao", 200, 280, s=0.3, moves=[mv(0, 90, x=1500, y=190, ease="linear")])]),
], after=0.42)
L("e17", "O domingo ficou muito comprido.", [
    W("Dona Neide sozinha no sofá, o celular apagado no colo", "salaNoite", [neide(420, acts=[a("sitOnly", 2), a("sigh", 26)], face=F("half", lookY=0.8, **{"brow": "worry"}), hold=HELD)], cx=620, z=1.25),
], after=0.7)
S("e18", 2.0, [
    C("O rosto de Caio, em silêncio, olhando a mãe da porta", "salaNoite", [caio(acts=[a("face", 10, eyes="sad", brow="worry", look=-0.5)], face=F("dot", look=-0.5))], cx=2100),
])

# ================================================================ UM ANO DEPOIS
S("y0", 1.8, [D("O relógio dá a volta inteira", chapter("UM ANO DEPOIS", "12 MESES", 4320), sfx=[fx("whoosh", 2, 0.24)], trans="torn")])
L("y1", "Um ano depois, o mundo provavelmente não acabou. Ficou mais lento. E mais perto de casa.", [
    W("A rua de manhã, reabastecida, cheia de gente", "rua", [extra("gui", 500, walks=[{"from": 0, "to": 70, "x0": 0, "x1": 320}], face=F("dot", "smile")), extra("gal", 1120, acts=[a("wave", 8, n=2)], face=F("happy", "smile")), caio(1520, walks=[{"from": 4, "to": 70, "x0": 0, "x1": -260}], dir=-1, face=F("dot", "smile"))], cx=1000),
    W("O mercadinho reabastecido, dona Neide no caderno", "mercado", [neide(1570, behind=True, acts=[a("writing", 6)], dir=-1, face=F("dot", "smirk")), extra("gal2", 1290, acts=[a("nod", 18)], face=F("dot", "smile"))], cx=1400, z=1.25, on="lento"),
], after=0.15)
L("y2", "Cuba já ensaiou uma coisa assim. Com pouco acesso à rede, os cubanos criaram o Paquete Semanal.", [
    D("A palavra Cuba e um HD aparecem no escuro", [p("big", 960, 300, text="CUBA", w=170, c="#ffc857", moves=[mv(0, 8, y=280)]), p("hd", 960, 720, s=0.8, text="PAQUETE", t2="SEMANAL", moves=[mv(4, 8, y=700)])]),
    D("Um HD passa de mão em mão", [p("hd", 620, 520, s=1.1, text="PAQUETE", t2="SEMANAL", moves=[mv(4, 34, x=1300, r=8)]), hand(260, 1030, 18, {"x": 420, "y": 880}, c="#b9607b"), hand(1680, 1030, -18, {"x": 1520, "y": 880}, c="#3f6b70")], on="criaram"),
], after=0.1)
L("y3", "Cerca de um terabyte de filme, música e aplicativo, passado de mão em mão toda semana.", [
    D("O contador de 1 terabyte", [counter(1, "POR SEMANA, NUM HD", 960, 500, pre="~", suf=" TERABYTE", w=860, n=18)]),
    T("Mãos conectam um HD num notebook sobre a mesa", [p("hd", 700, 520, s=1.1, r=-10, moves=[mv(4, 12, x=820)]), p("phone", 1320, 520, s=0.9, r=6, text="load", t2="COPIANDO", t3="42%"), hand(330, 1040, 18, {"x": 470, "y": 830})], on="música"),
], after=0.1)
L("y4", "É bem o que o Caio faz agora. Toda sexta, o HD da semana.", [
    W("Caio passa de moto com o baú da semana", "rua", [caio(420, key={"pose": "ride"}, slide={"from": 0, "to": 72, "x0": 0, "x1": 620}, face=F("happy", "smile"))], cx=420, to=1040, props=[p("moto", 450, 880, moves=[mv(0, 72, x=1070, ease="linear")])], sfx=[fx("rumble", 0, 0.14, 60)]),
    I("O HD da semana passa para outras mãos", "praca", [p("hd", 960, 560, s=1.6, moves=[mv(4, 10, r=-6, y=530)])], cx=800, on="sexta"),
], after=0.1)
L("y5", "E alguém quase certamente religa. O que sumiu foi a conexão, não o conhecimento.", [
    C("Bia concorda devagar", "hospital", [bia(acts=[a("nod", 8), a("face", 16, mouth="smile")], face=F("dot"))], cx=1100),
    D("Dois nós se ligam, depois quatro", [p("rede", 960, 540, m=4, s=1.5, moves=[mv(0, 20, s=1.55)]), p("big", 960, 170, text="2 NÓS... 4 NÓS...", w=88, c="#ffc857", moves=[mv(0, 6, y=150)])], on="conexão"),
], after=0.1)
L("y6", "Em 1969, a primeira mensagem da rede que virou a internet travou depois de duas letras.", [
    D("As letras L e O aparecem e o resto trava", [fact("1969"), p("big", 960, 600, text="LO", w=360, c="#ffc857", t2="O SISTEMA TRAVOU", moves=[mv(8, 6, y=570)])], sfx=[fx("click", 8, 0.35)]),
], after=0.1)
L("y7", "Dá pra começar pequeno de novo. Bairro. Cidade. País. Mas global, barata e rápida como antes? Pode levar anos.", [
    W("Antenas e fios: um homem liga um cabo no poste da rua", "rua", [extra("gui", 680, acts=[a("raiseHand", 6), a("stand", 40)], face=F("dot", look=-0.4, lookY=-0.8))], cx=640, z=1.25),
    D("A rede cresce em camadas: bairro, cidade, país", [p("rede", 960, 540, m=12, s=1.3, moves=[mv(0, 16, s=1.0)]), p("big", 400, 200, text="BAIRRO", w=70, c="#ffc857"), p("big", 960, 200, text="CIDADE", w=70, c="#ffc857", o=0, moves=[mv(14, 4, o=1)]), p("big", 1520, 200, text="PAÍS", w=70, c="#ffc857", o=0, moves=[mv(28, 4, o=1)])], on="Bairro"),
    D("O globo escurecido com poucos pontos acesos", [p("globe", 960, 540, n=0, s=1.0, moves=[mv(0, 60, s=1.04)]), p("big", 960, 560, text="PODE LEVAR ANOS", w=120, c="#ffc857")], on="global"),
], after=0.35)
L("y8", "Um domingo, a rede da cidade consegue um link pra fora.", [
    W("Domingo de manhã, Caio entra correndo pela porta com o celular erguido", "sala", [caio(2240, walks=[{"from": 2, "to": 28, "x0": 0, "x1": -720}], dir=-1, hold=HELD, acts=[a("raiseHand", 2)], face=F("wide", "ah", brow="high"))], cx=1500, to=1500, sfx=[fx("knock", 0, 0.3)]),
], after=0.21)
L("y9", "A imagem chia. Trava. Volta.", [
    T("A tela chia até virar um rosto", [phone("call", 960, 500, 1.25, t4="9:14")], motes=True, sfx=[fx("buzz", 0, 0.1, 30)]),
    D("A imagem trava na chamada de vídeo e volta", [phone("load", 960, 540, 1.45, t2="LENA", t3="Reconectando…")], on="Trava"),
    D("A chamada volta com a Lena acenando", [phone("call", 960, 540, 1.45, t4="9:14")], on="Volta"),
], after=0.35)
L("y10", "Oi, mãe.", [
    T("A voz sai do celular, e a mão aperta o braço do sofá", [phone("call", 960, 500, 1.35, t4="9:14"), hand(1500, 1000, -26, {"x": 1360, "y": 860}, c="#7a3f4a", curl=[0.3, 0.2, 0.2, 0.3])]),
], who_="lena", after=0.42)
L("y11", "Oi, filha.", [
    C("Dona Neide chora rindo", "sala", [neide(acts=[a("snapFace", 4, eyes="happy", mouth="ah", brow="worry"), a("nod", 14)], face=F("sad", "wave", brow="worry"))], cx=620),
], who_="neide", after=0.7)
S("y12", 1.8, [
    W("Na sala, mãe e filho juntos no sofá, o celular entre os dois", "sala", [neide(310, acts=[a("sitPhone", 2)], hold=HELD, face=F("happy", "smile")), caio(520, acts=[a("sitOnly", 2), a("turn", 14, to=-0.5)], dir=-1, face=F("dot", "smile"))], cx=620, z=1.3),
])
L("y13", "A internet não é o wi-fi. Não é o aplicativo. É a gente, falando com quem tá longe, sem pensar.", [
    D("A rede volta a acender, nó a nó", [p("rede", 960, 540, moves=[mv(0, 60, s=1.05)])]),
    W("A rua inteira à noite, janelas acesas e pessoas nas sacadas", "ruaNoite", [caio(960, acts=[a("lookUp", 8)], face=F("dot", "smile", look=0.2))], cx=960, on="gente"),
    C("Caio olha o céu, em paz", "pracaTarde", [caio(acts=[a("lookUp", 6), a("snapFace", 26, eyes="happy", mouth="smile")], face=F("dot"))], cx=1600, props=[Q(1340, 270)], on="longe"),
], after=0.35)
L("y14", "Se ela acabasse amanhã, quem você ia procurar primeiro? Conta aqui nos comentários.", [
    C("Caio olha direto para a câmera e levanta a sobrancelha", "rua", [caio(acts=[a("turn", 4, to=0), a("face", 14, brow="high", mouth="smirk")], face=F("dot", look=0.5))], cx=1000, props=[p("qmark", 1340, 270, s=0.9, o=0, moves=[mv(8, 6, o=1)])], sfx=[fx("ding", 8, 0.25)]),
    D("A pergunta fica escrita no escuro", [p("big", 960, 470, text="QUEM VOCÊ IA", w=140, c="#f3ead6", moves=[mv(0, 8, y=450)]), p("big", 960, 640, text="PROCURAR PRIMEIRO?", w=140, c="#ffc857", moves=[mv(4, 8, y=620)])], on="Conta"),
], after=0.21)
L("y15", "Enquanto ainda dá.", [
    M("Caio dá uma piscadinha e o sinal do celular some", "rua", [caio(1000, acts=[a("checkPhone", 4), a("snapFace", 18, eyes="half", mouth="smirk")], hold=HELD)], cx=1000, z=1.55),
], after=0.35)
S("end", 2.6, [
    D("O nome do canal acende ao lado da interrogação", [big("E SE DE REPENTE...", 480, 150, c="#ffc857"), p("big", 960, 620, text="QUAL PERGUNTA VEM A SEGUIR?", w=66), Q(1640, 280, 0.8)]),
])

# ---------------------------------------------------------------- pace
BREATHE = {"h5", "r3", "c6", "m8", "o4", "o7", "o18", "d3", "d12", "s4", "s11", "s15", "e6", "e9", "e16", "y1", "y9"}
# Long shots get a second angle or a punch-in. Which ones comes from the voice timing: see tools below and splits.json.
REACT = [[a("turn", 4, to=-0.5), a("nod", 18)], [a("lookUp", 4), a("turn", 20, to=0.4)], [a("lookDown", 4), a("nod", 20)], [a("turn", 4, to=0.5), a("face", 22, look=-0.3)]]


def alt(s, i, sid):
    k = s["kind"]
    new = {x: v for x, v in s.items() if x not in ("on", "tail", "at", "nudge", "sfx", "trans", "pill", "id", "to", "step")}
    new["action"] = s["action"] + " (outro ângulo)"
    if k in ("data", "top", "insert"):
        base = s.get("z", {"data": 1.0, "top": 1.25, "insert": 1.25}[k])
        new["z"] = base * (1.14 + 0.08 * i)
        new["ff"] = 70
        names = [q["p"] for q in s.get("props", [])]
        if k == "data":
            kept = [q for q in s.get("props", []) if 300 <= q["y"] <= 860 or q["p"] in ("rede", "globe", "phone", "bars", "cama", "vulcao")]
            new["props"] = kept or s.get("props", [])
            if "bars" in names or "cama" in names or "vulcao" in names:
                new["focus"] = [960, 620]
                new["z"] = base * 1.1
        if "carta" in names or "caderno" in names:
            new["focus"] = [960, 400]
            new["z"] = base * 1.08
        new["step"] = {"at": 3, "to": 1.07, "dur": 14}
        return new
    cast = s.get("cast", [])
    person = next((c for c in cast if not c.get("walks") and not c.get("slide") and "x" in c), None)
    if k in ("wide", "medium") and person:
        c = {"who": person["who"], "acts": REACT[(i + sid) % len(REACT)], "face": person.get("face", {"eyes": "dot", "mouth": "flat"})}
        return {"kind": "close", "action": new["action"], "set": s["set"], "cast": [c], "cx": person["x"] + 40}
    if k in ("wide", "medium"):
        new["cx"] = s.get("cx", 960) + (260 if i % 2 == 0 else -220)
        new["z"] = s.get("z", 1.12) * 1.18
        new["step"] = {"at": 3, "to": 1.05, "dur": 18}
        new["ff"] = 70
        return new
    if k == "close":
        person = cast[0]
        return {"kind": "medium", "action": new["action"], "set": s["set"], "cast": [{"who": person["who"], "x": s.get("cx", 960), "face": person.get("face", {}), "acts": REACT[(i + sid + 1) % len(REACT)]}], "cx": s.get("cx", 960), "z": 1.5, "ff": 70}
    return new


splits_path = HERE / "splits.json"
splits = json.loads(splits_path.read_text()) if splits_path.exists() else {}
for item in SCRIPT:
    out = []
    for j, s in enumerate(item["shots"]):
        out.append(s)
        for i in range(splits.get(f"{item['id']}:{j}", 0)):
            out.append(alt(s, i, j))
    if item["id"] in BREATHE:  # a beat with no words after the line, with the picture carrying on
        item["after"] = item.get("after", 0.25) + 1.0
        last = alt(item["shots"][-1], 0, 3)
        last["tail"] = 0.12
        last["action"] = item["shots"][-1]["action"] + " (pausa)"
        out.append(last)
    item["shots"] = out
    for s in item["shots"]:
        if s["kind"] == "data":
            s["develops"] = True
        if s["kind"] in ("data", "top"):
            s["motes"] = True  # dust in the air: a held card or table still has something alive in it
        for n_c, c in enumerate(s.get("cast", [])):  # a second small action later in the hold, on its own beat
            if not c.get("walks") and not c.get("slide"):
                c["acts"] = list(c.get("acts", [])) + [a("nod", 22 + n_c * 9), a("turn", 38 + n_c * 7, to=0.3 if n_c % 2 else -0.3), a("nod", 58 + n_c * 5), a("turn", 74 + n_c * 7, to=-0.2 if n_c % 2 else 0.2)]
        has = any(c.get("acts") or c.get("walks") for c in s.get("cast", [])) or any(q.get("moves") for q in s.get("props", [])) or s.get("step")
        if not has:
            s["step"] = {"at": 4, "to": 1.03, "dur": 60}

SECTIONS = {  # the bed follows the acts: item id -> [chord (Hz), level in dB]
    "h1": [[110.0, 164.8, 220.0], -2], "m0": [[98.0, 146.8, 246.9], -2], "o0": [[87.3, 130.8, 220.0], -1], "d0": [[110.0, 130.8, 196.0], 0],
    "s0": [[98.0, 116.5, 174.6], 0], "e0": [[87.3, 130.8, 174.6], -3], "e7": [[82.4, 123.5, 196.0], -9], "y0": [[87.3, 130.8, 220.0], -5], "y8": [[98.0, 146.8, 220.0], -3], "y13": [[110.0, 164.8, 246.9], 1],
}

FILM = {
    "title": "E se, de repente, a internet acabasse?",
    "lead": 0.25,
    "tail": 0.5,
    "fade": 18,
    "bedVolume": 0.72,
    "roomVolume": 0.05,
    "sections": SECTIONS,
    "looks": {
        "caio": {"torso": "#2e6f92", "sleeve": "#27607f", "legs": "#2b3138"},
        "neide": {"torso": "#7a3f4a", "item": "bun", "legs": "#3f3540"},
        "bia": {"torso": "#4f9a8e", "sleeve": "#438679", "legs": "#3f7f75", "item": "bob"},
        "cliente": {"torso": "#a0782f", "item": "curls"},
        "gui": {"torso": "#5c6a6e", "item": "slick"},
        "guy2": {"torso": "#54605a"},
        "gal": {"torso": "#6f5a66", "item": "bun"},
        "gal2": {"torso": "#6a5f4c", "item": "bob"},
    },
    "voices": {
        "narrator": ["pt-BR-AntonioNeural", "+4%", "-1Hz"],
        "neide": ["pt-BR-FranciscaNeural", "-6%", "-2Hz"],
        "bia": ["pt-BR-ThalitaMultilingualNeural", "-4%", "+0Hz"],
        "cliente": ["pt-BR-ThalitaMultilingualNeural", "-2%", "+0Hz"],
        "lena": ["pt-BR-ThalitaMultilingualNeural", "-10%", "-2Hz"],
    },
    "script": SCRIPT,
}

(HERE / "film.json").write_text(json.dumps(FILM, ensure_ascii=False, indent=0), encoding="utf-8")
n = sum(len(i["shots"]) for i in SCRIPT)
words = sum(len(i.get("text", "").split()) for i in SCRIPT)
print(f"{n} shots, {words} words, {len(SCRIPT)} items")
