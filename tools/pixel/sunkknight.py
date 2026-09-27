"""Sunken Knight (Dreadhollow, the Aqueduct's 7:30 boss) as true pixel art.
Canvas 98x118 = the game's sprite cell for a 46x56-unit painter at 2 px/unit with its 1.5-unit pad.
Light: top-left. Outline: dark outside line (#0b0710), selout inside per material on the shadow side."""
import sys, json
sys.path.insert(0, "/home/user/game/.claude/skills/pixel-art-studio/scripts")
from pixelstudio import Sprite

# ---- palette (hard budget ~26) ----
OUT = "#0b0710"
PL = ["#141e28", "#23363f", "#3a5458", "#5f8580", "#9cbcb2"]       # verdigris steel, dark -> light (hue-shifted)
WEED = ["#10200f", "#1f3a1c", "#3a5e2a", "#6a8a3a"]                  # kelp cloak
BARN = ["#5a5446", "#9a9480", "#d8d2bc"]                            # barnacles
GLOW = ["#1e6e66", "#50e0c0", "#d8fff4"]                            # eyes, rune
WOOD = ["#24160e", "#4a2e1a", "#6e4a2a"]                            # trident shaft
BRONZE = ["#4a3014", "#8a6428", "#c8a050"]                           # trim
DRIP = "#7ac8d8"

W, H = 98, 118
s = Sprite(W, H)

def blob(pts, ramp, shift=(-2, -2), light_pts=None):
    """darkest shape, then the mid shifted toward the light, then a highlight."""
    s.polygon(pts, ramp[1])
    s.polygon([(x + shift[0], y + shift[1]) for x, y in pts], ramp[2], only="opaque")
    if light_pts:
        s.polygon(light_pts, ramp[3], only="opaque")

def barnacle(x, y, big=False):
    """a small cone with a dark mouth, lit from the top-left"""
    s.rect(x - 1, y, x + 1, y + 2, BARN[0]); s.line(x - 1, y, x + 1, y, BARN[1]); s.px(x - 1, y, BARN[2]); s.px(x, y + 1, OUT)
    if big: s.line(x - 2, y + 1, x - 2, y + 2, BARN[1]); s.line(x + 2, y + 1, x + 2, y + 2, BARN[0]); s.px(x, y - 1, BARN[1])

def cluster(pts):
    for i, (x, y) in enumerate(pts): barnacle(x, y, i == 0)

def draw(f):
    w = 2 if f else -2          # stride
    sw = 1 if f else -1         # cloak / weed sway

    # ---------- cloak of kelp behind ----------
    s.use(layer="cloak")
    cloak = [(30, 38), (66, 38), (74, 70), (78 + sw, 100), (70, 104), (62 + sw, 98), (56, 106), (48, 100), (40 + sw, 106), (32, 99), (24, 104), (20 + sw, 96), (24, 66)]
    s.polygon(cloak, WEED[1])
    s.polygon([(x - 3, y - 2) for x, y in cloak[:6]] + [(30, 60)], WEED[2], only="opaque")
    for i, x in enumerate(range(26, 76, 7)):         # strands hanging from the hem
        s.line(x, 92 + (i % 3) * 2, x + sw, 110 - (i % 2) * 3, WEED[1 + (i % 2)])
    s.polygon([(60, 40), (66, 38), (74, 70), (78 + sw, 100), (70, 104), (62 + sw, 98)], WEED[0], only="opaque")
    for x in range(28, 70, 9): s.line(x, 44, x - 2 + sw, 92, WEED[3], only=WEED[2])

    # ---------- far leg ----------
    s.use(layer="legF")
    lx = 36 - w
    s.rect(lx, 70, lx + 9, 104, PL[1]); s.rect(lx + 1, 70, lx + 4, 102, PL[2], only="opaque")
    s.rect(lx - 1, 88, lx + 10, 91, PL[1]); s.rect(lx, 88, lx + 6, 89, PL[2], only="opaque")   # knee cop
    s.rect(lx - 2, 103, lx + 11, 108, PL[0]); s.rect(lx - 1, 103, lx + 7, 105, PL[1], only="opaque")  # sabaton

    # ---------- near leg ----------
    s.use(layer="legN")
    nx = 52 + w
    s.rect(nx, 70, nx + 10, 104, PL[1]); s.rect(nx + 1, 70, nx + 6, 102, PL[2], only="opaque"); s.line(nx + 2, 72, nx + 2, 100, PL[3])
    s.rect(nx - 1, 87, nx + 11, 91, PL[2]); s.rect(nx, 87, nx + 6, 88, PL[4], only="opaque")
    s.rect(nx - 1, 103, nx + 13, 108, PL[1]); s.rect(nx, 103, nx + 8, 105, PL[3], only="opaque")
    cluster([(nx + 4, 94), (nx + 7, 97)])

    # ---------- tassets (armoured skirt) ----------
    s.use(layer="skirt")
    for i, x0 in enumerate([33, 42, 51, 60]):
        s.polygon([(x0, 62), (x0 + 8, 62), (x0 + 8, 72 + (i % 2) * 2), (x0, 72 + (i % 2) * 2)], PL[2] if i < 2 else PL[1])
        s.line(x0 + 1, 63, x0 + 1, 70, PL[3] if i < 2 else PL[2]); s.line(x0 + 8, 62, x0 + 8, 73, PL[0])
    s.rect(33, 61, 68, 62, BRONZE[1]); s.line(33, 61, 60, 61, BRONZE[2])

    # ---------- cuirass ----------
    s.use(layer="torso")
    torso = [(30, 38), (68, 38), (65, 52), (61, 63), (37, 63), (33, 52)]
    s.polygon(torso, PL[1])
    s.polygon([(30, 38), (60, 38), (56, 50), (52, 60), (36, 60), (32, 50)], PL[2], only="opaque")
    s.polygon([(32, 39), (47, 39), (44, 47), (35, 50)], PL[3], only="opaque")          # the lit upper plate
    s.line(34, 40, 45, 40, PL[4]); s.line(33, 41, 33, 48, PL[4])                        # specular edge
    s.line(49, 40, 49, 61, PL[0]); s.line(48, 41, 48, 59, PL[3])                         # the keel
    s.line(35, 53, 47, 57, PL[1]); s.line(51, 57, 62, 52, PL[0])                         # lower plate seams
    cluster([(58, 46), (61, 49), (56, 50)]); cluster([(38, 56), (41, 58)]); cluster([(63, 42)])

    # ---------- far arm (hangs at the side, gauntlet clenched) ----------
    s.use(layer="armF")
    s.polygon([(26, 42), (32, 42), (30, 66), (24, 66)], PL[1]); s.polygon([(26, 42), (29, 42), (27, 64), (25, 64)], PL[2], only="opaque")
    s.rect(22, 64, 31, 72, PL[1]); s.rect(23, 64, 28, 68, PL[2], only="opaque")
    for k in range(4): s.px(23 + k * 2, 72, PL[0])

    # ---------- pauldrons ----------
    s.use(layer="paul")
    for cx, dark in [(29, True), (69, False)]:
        s.ellipse(cx - 10, 31, cx + 10, 45, PL[1])
        s.ellipse(cx - 11, 30, cx + 7, 42, PL[2], only="opaque")
        s.ellipse(cx - 9, 31, cx + 1, 37, PL[3], only="opaque")
        s.line(cx - 7, 32, cx - 2, 31, PL[4])
        s.line(cx - 9, 42, cx + 9, 42, PL[0]); s.line(cx - 8, 43, cx + 8, 43, BRONZE[1])
    cluster([(24, 36), (27, 39)]); cluster([(73, 35), (70, 38), (76, 38)])

    # ---------- great helm ----------
    s.use(layer="helm")
    hx, hy = 49, 22
    helm = [(hx - 6, hy - 11), (hx + 6, hy - 11), (hx + 9, hy - 8), (hx + 10, hy + 10), (hx + 5, hy + 14), (hx - 6, hy + 14), (hx - 10, hy + 10), (hx - 9, hy - 8)]
    s.polygon(helm, PL[1]); s.polygon([(x - 2, y - 1) for x, y in helm], PL[2], only="opaque")
    s.polygon([(hx - 6, hy - 10), (hx, hy - 10), (hx - 2, hy - 2), (hx - 8, hy - 1), (hx - 8, hy - 7)], PL[3], only="opaque")
    s.line(hx - 5, hy - 10, hx + 1, hy - 10, PL[4]); s.px(hx - 8, hy - 6, PL[4])
    s.line(hx + 9, hy - 6, hx + 9, hy + 9, PL[0])
    s.rect(hx - 8, hy - 1, hx + 8, hy + 1, OUT)                         # the visor slit
    s.rect(hx - 5, hy - 1, hx + 6, hy, GLOW[1]); s.px(hx - 2, hy - 1, GLOW[2]); s.px(hx + 3, hy - 1, GLOW[2])
    s.line(hx, hy + 3, hx, hy + 12, PL[1])                               # breathing ridge
    for k in range(3): s.px(hx + 3, hy + 5 + k * 2, OUT); s.px(hx + 6, hy + 5 + k * 2, OUT)   # breaths
    # a crest of branching coral on top
    s.use(layer="crest")
    CR = ["#6a1e2a", "#b0404a", "#e08070"]
    for x0, x1, y1 in [(hx - 2, hx - 6, hy - 22), (hx + 1, hx + 3, hy - 25), (hx + 3, hx + 8, hy - 20)]:
        s.line(x0, hy - 11, x1, y1, CR[1]); s.line(x0 + 1, hy - 11, x1 + 1, y1, CR[0])
        s.px(x1, y1 - 1, CR[2])
    s.line(hx - 4, hy - 17, hx - 8, hy - 19, CR[1]); s.line(hx + 5, hy - 16, hx + 9, hy - 18, CR[1])
    # weed trailing from the helm
    s.use(layer="helmweed")
    for i, x in enumerate([hx - 9, hx - 5, hx + 8]):
        s.line(x, hy + 13, x + sw, hy + 22 + (i % 2) * 3, WEED[2]); s.line(x + 1, hy + 13, x + 1 + sw, hy + 19, WEED[1])
    cluster([(hx - 6, hy + 5)]); cluster([(hx + 5, hy - 7)])

    # ---------- near arm raising the trident ----------
    s.use(layer="armN")
    s.polygon([(68, 42), (75, 44), (80, 56), (74, 58)], PL[2]); s.polygon([(68, 42), (72, 43), (76, 54), (73, 55)], PL[3], only="opaque")
    s.rect(73, 54, 83, 62, PL[2]); s.rect(74, 54, 79, 57, PL[3], only="opaque"); s.line(74, 61, 82, 61, PL[1])

    # ---------- trident ----------
    s.use(layer="trident")
    b = 0 if f else 1
    s.line(81, 110, 86, 17 + b, WOOD[1]); s.line(82, 110, 87, 17 + b, WOOD[0]); s.line(80, 108, 85, 19 + b, WOOD[2])
    s.rect(80, 55, 85, 58, BRONZE[1]); s.line(80, 55, 85, 55, BRONZE[2])     # the grip ring over the fist
    t0 = 17 + b
    s.rect(78, t0 - 1, 95, t0 + 1, PL[2]); s.line(78, t0 - 1, 94, t0 - 1, PL[4])   # crossbar
    for x, top in [(79, t0 - 9), (86, t0 - 13), (93, t0 - 9)]:          # three tines, barbed
        s.line(x, t0, x, top, PL[3]); s.line(x + 1, t0, x + 1, top + 1, PL[1])
        s.px(x, top - 1, PL[4]); s.px(x - 1, top + 3, PL[3]); s.px(x + 2, top + 3, PL[2])
    for k in range(3): s.px(88, t0 + 6 + k * 3, DRIP)                    # water running off the head

    # ---------- kelp hanging off the pauldrons, water running off the armour ----------
    s.use(layer="drape")
    for x, l in [(21, 9), (25, 13), (33, 7), (64, 8), (73, 11)]:
        s.line(x, 43, x + sw, 43 + l, WEED[2]); s.px(x + sw, 44 + l, WEED[3])
    for x, y in [(30, 74), (77, 64), (45, 37)]:
        s.line(x, y, x, y + 2, DRIP)

    # ---------- merge, outline, drips ----------
    s.flatten()
    s.outline(OUT, where="outside")
    for (x, y) in [(40 - w, 110), (58 + w, 111), (30, 106)]:
        if s.get(x, y) is None: s.px(x, y, DRIP)

s.use(frame=1); draw(0)
s.add_frame(copy=False); s.use(frame=2); draw(1)
s.set_duration(300, frames=[1, 2])

s.preview("preview.png", scale=6)
s.save_silhouette("silhouette.png", frame=1, scale=5)
s.save_png("sunkknight.png", frame=1); s.save_png("sunkknight_f2.png", frame=2)
s.save_png("sunkknight@4x.png", frame=1, scale=4)
s.save_gif("sunkknight.gif", scale=4)
s.stats()
