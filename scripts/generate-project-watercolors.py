"""Draw the portfolio's original concept covers with OpenCV, without model output.

Optional artwork tooling: python -m pip install numpy opencv-python-headless
Run from any directory: python scripts/generate-project-watercolors.py
The fixed seeds make the paper grain, pigment blooms, and pencil marks repeatable.
These editorial illustrations describe project subjects, not measured results.
"""

from pathlib import Path

import cv2
import numpy as np


WIDTH, HEIGHT = 1600, 800
OUTPUT = Path(__file__).resolve().parents[1] / "src/assets/projects"
PAPER = (246, 242, 233)
INK = (71, 83, 86)
BLUE = (84, 118, 139)
SAGE = (121, 151, 131)
CLAY = (192, 131, 105)
OCHRE = (203, 167, 105)
PALE = (223, 226, 215)


class Watercolor:
    def __init__(self, seed):
        self.rng = np.random.default_rng(seed)
        self.shape = (HEIGHT, WIDTH)
        self.field = self.noise(9, 0.55) + self.noise(32, 0.3) + self.noise(140, 0.16)
        self.grain = self.rng.normal(0, 1, self.shape).astype(np.float32)
        self.fiber = cv2.GaussianBlur(self.grain, (3, 9), 0)
        self.canvas = np.empty((*self.shape, 3), np.float32)
        self.canvas[:] = PAPER
        self.canvas += (self.grain * 0.85 + self.fiber * 1.4)[..., None]

    def noise(self, scale, strength=1):
        values = self.rng.normal(0, strength, (scale, scale * 2)).astype(np.float32)
        return cv2.resize(values, (WIDTH, HEIGHT), interpolation=cv2.INTER_CUBIC)

    def mask(self):
        return np.zeros(self.shape, np.uint8)

    def paint(self, mask, color, opacity=0.78, wet=1.8):
        if not np.any(mask):
            return
        # A variable pigment load and an edge deposit reproduce a transparent wash.
        distance = cv2.distanceTransform(mask, cv2.DIST_L2, 3)
        edge = np.exp(-distance / 6) * (mask > 0)
        bleed = cv2.GaussianBlur(mask.astype(np.float32) / 255, (0, 0), wet)
        pigment = np.clip(0.85 + self.field * 0.24 + self.grain * 0.035, 0.35, 1.0)
        alpha = np.clip(bleed * opacity * pigment + edge * opacity * 0.24, 0, 0.97)
        loaded = np.array(color, np.float32)[None, None, :]
        if color != PAPER:
            loaded = loaded + self.field[..., None] * 3
        self.canvas = self.canvas * (1 - alpha[..., None]) + loaded * alpha[..., None]

    def polygon(self, points, color, opacity=0.8, outline=True, wet=1.7):
        mask = self.mask()
        cv2.fillPoly(mask, [np.array(points, np.int32)], 255, cv2.LINE_AA)
        self.paint(mask, color, opacity, wet)
        if outline:
            self.line([*points, points[0]], width=2, opacity=0.50)

    def ellipse(self, center, axes, color, opacity=0.8, angle=0, outline=True):
        mask = self.mask()
        cv2.ellipse(mask, center, axes, angle, 0, 360, 255, -1, cv2.LINE_AA)
        self.paint(mask, color, opacity)
        if outline:
            t = np.linspace(0, 2 * np.pi, 100)
            a = np.radians(angle)
            points = np.column_stack((
                center[0] + axes[0] * np.cos(t) * np.cos(a) - axes[1] * np.sin(t) * np.sin(a),
                center[1] + axes[0] * np.cos(t) * np.sin(a) + axes[1] * np.sin(t) * np.cos(a),
            ))
            self.line(points, width=2, opacity=0.55)

    def line(self, points, color=INK, width=2, opacity=0.54, wobble=0.55):
        points = np.asarray(points, np.float32)
        # Sample long segments so a pencil stroke can wander gently between anchors.
        samples = []
        for first, last in zip(points[:-1], points[1:]):
            count = max(2, int(np.linalg.norm(last - first) / 9))
            segment = np.linspace(first, last, count, endpoint=False)
            drift = self.rng.normal(0, wobble, segment.shape).astype(np.float32)
            drift = cv2.GaussianBlur(drift, (1, 9), 0)
            segment += drift
            samples.extend(segment)
        samples.append(points[-1])
        mask = self.mask()
        cv2.polylines(mask, [np.array(samples, np.int32)], False, 255, width, cv2.LINE_AA)
        alpha = mask.astype(np.float32) / 255 * opacity
        alpha *= np.clip(0.92 + self.grain * 0.13, 0.35, 1)
        self.canvas = self.canvas * (1 - alpha[..., None]) + np.array(color) * alpha[..., None]

    def wash(self, center, axes, color, opacity=0.13):
        mask = self.mask()
        t = np.linspace(0, np.pi * 2, 110)
        wobble = self.rng.normal(1, 0.09, len(t))
        wobble = cv2.GaussianBlur(wobble.astype(np.float32).reshape(1, -1), (9, 1), 0).ravel()
        points = np.column_stack((center[0] + axes[0] * np.cos(t) * wobble,
                                  center[1] + axes[1] * np.sin(t) * wobble))
        cv2.fillPoly(mask, [points.astype(np.int32)], 255)
        self.paint(mask, color, opacity, wet=14)

    def background(self):
        self.wash((660, 435), (670, 325), SAGE, 0.07)
        self.wash((1150, 355), (550, 320), BLUE, 0.035)
        self.wash((230, 680), (420, 155), OCHRE, 0.045)

    def arrow(self, points, color=SAGE, width=5, opacity=0.8):
        self.line(points, color, width, opacity)
        tip = np.array(points[-1], np.float32)
        direction = tip - points[-2]
        direction /= np.linalg.norm(direction)
        side = np.array([-direction[1], direction[0]])
        self.line([tip - direction * 23 + side * 12, tip,
                   tip - direction * 23 - side * 12], color, width, opacity)

    @staticmethod
    def curve(points):
        anchors = np.array([points[0], *points, points[-1]], np.float32)
        samples = []
        for a, b, c, d in zip(anchors[:-3], anchors[1:-2], anchors[2:-1], anchors[3:]):
            for t in np.linspace(0, 1, 18, endpoint=False):
                samples.append(0.5 * ((2 * b) + (-a + c) * t
                                     + (2 * a - 5 * b + 4 * c - d) * t ** 2
                                     + (-a + 3 * b - 3 * c + d) * t ** 3))
        return [*samples, np.array(points[-1], np.float32)]

    def save(self, name):
        OUTPUT.mkdir(parents=True, exist_ok=True)
        rgb = np.clip(self.canvas[40:760, 80:1520], 0, 255).astype(np.uint8)
        rgb = cv2.resize(rgb, (WIDTH, HEIGHT), interpolation=cv2.INTER_CUBIC)
        path = OUTPUT / f"{name}.webp"
        if not cv2.imwrite(str(path), cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR),
                           [cv2.IMWRITE_WEBP_QUALITY, 90]):
            raise RuntimeError(f"Could not write {path}")
        print(f"{path.name}: {WIDTH} × {HEIGHT}, {path.stat().st_size // 1024} KiB")


def robotics():
    p = Watercolor(1221)
    p.background()
    # A painted route leads around obstacles; a wheeled platform is the main subject.
    route = [(1190, 610), (1240, 570), (1270, 520), (1260, 470), (1215, 435),
             (1150, 425), (1040, 430), (985, 395), (950, 325), (900, 288),
             (820, 278), (740, 305), (690, 360)]
    route = p.curve(route)
    p.line(route, SAGE, 12, 0.28, 1.5)
    p.arrow(route, SAGE, 4, 0.68)
    p.wash((1128, 359), (155, 45), BLUE, 0.13)
    p.polygon([(1060, 226), (1180, 205), (1248, 252), (1126, 278)], PALE, 0.85)
    p.polygon([(1060, 226), (1126, 278), (1126, 397), (1058, 347)], SAGE, 0.68)
    p.polygon([(1126, 278), (1248, 252), (1248, 370), (1126, 397)], BLUE, 0.64)
    p.wash((981, 615), (140, 35), BLUE, 0.1)
    p.polygon([(910, 486), (1000, 472), (1062, 506), (970, 530)], OCHRE, 0.64)
    p.polygon([(910, 486), (970, 530), (970, 614), (910, 575)], CLAY, 0.5)
    p.polygon([(970, 530), (1062, 506), (1062, 588), (970, 614)], OCHRE, 0.82)
    p.wash((558, 620), (308, 65), BLUE, 0.16)
    # Visible wheels and a lidar turret avoid the toy-robot/mascot reading.
    for center in [(377, 541), (743, 518)]:
        p.ellipse(center, (33, 62), INK, 0.93, -12)
        p.ellipse(center, (13, 33), BLUE, 0.85, -12)
    p.polygon([(337, 459), (791, 452), (782, 553), (751, 581), (682, 607),
               (565, 618), (466, 609), (385, 584), (345, 553)], BLUE, 0.84)
    p.ellipse((564, 459), (227, 91), SAGE, 0.94, -2)
    p.ellipse((564, 450), (188, 65), PALE, 0.68, -2)
    p.ellipse((551, 570), (25, 15), INK, 0.95)
    p.line([(374, 532), (405, 551), (447, 564)], PAPER, 3, 0.65)
    p.line([(646, 566), (681, 556), (718, 540)], PAPER, 3, 0.65)
    p.polygon([(463, 344), (637, 344), (641, 444), (623, 457), (483, 462),
               (460, 448)], BLUE, 0.84)
    p.ellipse((550, 346), (87, 28), INK, 0.87)
    p.ellipse((550, 337), (78, 23), PALE, 0.88)
    p.line([(471, 390), (630, 387)], INK, 5, 0.79)
    p.ellipse((555, 334), (19, 7), SAGE, 0.76)
    for center in [(438, 483), (686, 469)]:
        p.ellipse(center, (7, 4), INK, 0.62, outline=False)
    p.line([(315, 665), (752, 665)], INK, 1, 0.17)
    p.save("robotics")


def library():
    p = Watercolor(1222)
    p.background()
    p.wash((765, 647), (530, 48), BLUE, 0.13)
    # Tall spines and a quiet catalogue drawer provide a clear library silhouette.
    p.polygon([(971, 272), (1200, 265), (1287, 307), (1053, 322)], PALE, 0.8)
    p.polygon([(971, 272), (1053, 322), (1050, 611), (969, 556)], BLUE, 0.72)
    p.polygon([(1053, 322), (1287, 307), (1283, 595), (1050, 611)], SAGE, 0.84)
    for y in [355, 474]:
        p.polygon([(1083, y), (1257, y - 11), (1255, y + 87), (1082, y + 98)],
                  PALE, 0.68)
        p.polygon([(1132, y + 29), (1213, y + 24), (1213, y + 48), (1132, y + 53)],
                  PAPER, 0.95)
        p.line([(1154, y + 68), (1154, y + 79), (1192, y + 76), (1192, y + 66)],
               INK, 3, 0.68)
    books = [([(345, 214), (422, 202), (438, 583), (359, 595)], CLAY),
             ([(438, 156), (511, 150), (528, 581), (453, 587)], BLUE),
             ([(523, 246), (600, 247), (599, 586), (527, 581)], OCHRE),
             ([(644, 191), (719, 206), (653, 590), (576, 577)], SAGE)]
    for points, color in books:
        p.polygon(points, color, 0.87)
        a, b, c, d = map(np.array, points)
        for f in [0.08, 0.13, 0.83, 0.88]:
            p.line([a + (d - a) * f + (b - a) * 0.1,
                    b + (c - b) * f - (b - a) * 0.1], PAPER, 3, 0.63)
        p.line([a * 0.92 + b * 0.08, d * 0.92 + c * 0.08], INK, 2, 0.3)
    # An open volume spreads across the foreground, with only a few page strokes.
    p.polygon([(532, 578), (658, 619), (767, 658), (940, 579), (799, 511), (675, 537)],
              BLUE, 0.69)
    p.polygon([(551, 558), (654, 579), (767, 640), (678, 540), (581, 504)], PAPER, 0.98)
    p.polygon([(678, 540), (768, 640), (925, 561), (822, 482), (741, 506)], PAPER, 0.98)
    p.line([(581, 504), (677, 534), (744, 601), (768, 640)], INK, 2, 0.57)
    for offset in range(0, 4):
        y = offset * 13
        p.line([(584 + offset * 8, 538 + y), (643 + offset * 12, 554 + y)],
               INK, 1, 0.23)
        p.line([(762 + offset * 11, 531 + y), (810 + offset * 12, 506 + y)],
               INK, 1, 0.23)
    p.line([(571, 583), (646, 604), (762, 649), (919, 574)], INK, 1, 0.35)
    p.polygon([(780, 537), (797, 528), (858, 586), (847, 583), (847, 598)], CLAY, 0.82)
    p.save("library")


def housing():
    p = Watercolor(1223)
    p.background()
    # The map is deliberately schematic: it is not an invented data visualization.
    for points in [([(219, 564), (596, 676), (1019, 607), (1386, 444)], PALE),
                   ([(253, 226), (778, 169), (1303, 274)], BLUE)]:
        p.line(points[0], points[1], 14, 0.12, 1)
    for points in [[(284, 282), (595, 305), (875, 246), (1310, 307)],
                   [(209, 432), (586, 469), (849, 391), (1380, 431)],
                   [(392, 188), (331, 467), (385, 607)],
                   [(703, 190), (639, 412), (682, 652)],
                   [(1080, 237), (999, 487), (1108, 610)]]:
        p.line(points, BLUE, 2, 0.16, 1.9)
    def house(x, y, size, color):
        p.wash((x + size * 0.56, y + size * 1.02), (int(size * 0.73), 24), BLUE, 0.11)
        p.polygon([(x, y + size * 0.42), (x + size * 0.48, y),
                   (x + size, y + size * 0.42), (x + size, y + size),
                   (x, y + size)], color, 0.83)
        p.polygon([(x + size, y + size * 0.42), (x + size * 1.3, y + size * 0.25),
                   (x + size * 1.3, y + size * 0.82), (x + size, y + size)], BLUE, 0.57)
        p.polygon([(x + size * 0.48, y), (x + size * 0.79, y - size * 0.15),
                   (x + size * 1.3, y + size * 0.25), (x + size, y + size * 0.42)],
                  BLUE, 0.81)
        p.line([(x - 12, y + size * 0.43), (x + size * 0.48, y - 5),
                (x + size + 12, y + size * 0.44)], INK, 3, 0.6)
        p.polygon([(x + size * 0.61, y + size * 0.66), (x + size * 0.81, y + size * 0.66),
                   (x + size * 0.81, y + size), (x + size * 0.61, y + size)], BLUE, 0.8)
        p.polygon([(x + size * 0.18, y + size * 0.59), (x + size * 0.4, y + size * 0.59),
                   (x + size * 0.4, y + size * 0.79), (x + size * 0.18, y + size * 0.79)],
                  PAPER, 0.92)
        p.line([(x + size * 0.29, y + size * 0.59), (x + size * 0.29, y + size * 0.79)],
               INK, 1, 0.47)
    house(628, 251, 178, SAGE)
    house(312, 342, 242, CLAY)
    # A large magnifying glass signifies analysis; bars carry no ticks or values.
    for x, height, color in [(1014, 91, CLAY), (1090, 147, BLUE), (1166, 120, SAGE)]:
        p.polygon([(x, 518 - height), (x + 43, 515 - height), (x + 44, 518), (x, 523)],
                  color, 0.81)
    p.line([(987, 536), (1243, 524)], INK, 2, 0.44)
    center, radius = (1112, 432), 177
    t = np.linspace(0, np.pi * 2, 140)
    circle = np.column_stack((center[0] + radius * np.cos(t), center[1] + radius * np.sin(t)))
    p.line(circle, BLUE, 18, 0.63, 1.5)
    p.line(circle, INK, 2, 0.6)
    p.ellipse(center, (161, 161), PALE, 0.08, outline=False)
    p.polygon([(1220, 566), (1248, 544), (1350, 650), (1322, 675)], OCHRE, 0.92)
    p.line([(976, 410), (984, 384), (999, 357)], PAPER, 4, 0.9)
    p.save("housing-analysis")


def automation():
    p = Watercolor(1225)
    p.background()
    p.wash((785, 645), (535, 48), BLUE, 0.13)
    # Input sheets, a browser, and a journal describe automation without business data.
    for offset in [26, 13, 0]:
        p.polygon([(232 + offset, 310 - offset), (393 + offset, 298 - offset),
                   (407 + offset, 541 - offset), (246 + offset, 553 - offset)],
                  PAPER, 0.98)
    for y, length in [(350, 106), (383, 88), (416, 112), (449, 74)]:
        p.line([(266, y), (266 + length, y - 6)], BLUE, 3, 0.46)
    p.arrow([(433, 410), (491, 410), (521, 400)], SAGE, 5, 0.73)
    p.polygon([(543, 215), (1007, 221), (1000, 564), (537, 558)], PAPER, 0.98)
    p.polygon([(543, 215), (1007, 221), (1006, 268), (542, 262)], BLUE, 0.77)
    for x, color in [(564, CLAY), (583, OCHRE), (602, SAGE)]:
        p.ellipse((x, 239), (5, 5), color, 0.85, outline=False)
    p.line([(652, 239), (917, 243)], PAPER, 3, 0.68)
    for y in [309, 365, 421]:
        p.polygon([(574, y), (598, y), (598, y + 25), (574, y + 25)],
                  PALE, 0.64)
        p.line([(614, y + 12), (847, y + 15)], BLUE, 3, 0.34)
        p.line([(908, y + 11), (918, y + 20), (935, y + 1)], SAGE, 4, 0.8)
    p.arrow([(1019, 375), (1081, 375), (1113, 389)], SAGE, 5, 0.73)
    p.polygon([(1140, 287), (1300, 302), (1281, 577), (1121, 562)], SAGE, 0.73)
    p.polygon([(1154, 306), (1286, 319), (1269, 557), (1136, 545)], PAPER, 0.97)
    p.polygon([(1180, 284), (1240, 290), (1240, 325), (1177, 319)], BLUE, 0.68)
    p.line([(1162, 363), (1258, 372)], INK, 2, 0.35)
    p.line([(1159, 395), (1243, 403)], INK, 2, 0.35)
    p.line([(1160, 468), (1184, 494), (1233, 439)], SAGE, 8, 0.83)
    # A cog is a simple mechanical cue, hand-drawn with transparent pigment.
    center = np.array([858, 555])
    angles = np.linspace(0, 2 * np.pi, 48, endpoint=False)
    radii = np.array([104, 104, 83, 83] * 12)
    points = center + np.column_stack((np.cos(angles), np.sin(angles))) * radii[:, None]
    p.polygon(points, BLUE, 0.83)
    p.ellipse(tuple(center), (56, 56), PAPER, 0.98)
    p.ellipse(tuple(center), (31, 31), SAGE, 0.78)
    p.line([(259, 662), (1242, 662)], INK, 1, 0.14)
    p.save("automaton")


def scheduling():
    p = Watercolor(1224)
    p.background()
    # Two parallel task routes converge. Color is an editorial cue, not schedule data.
    p.arrow([(412, 412), (482, 412), (482, 272), (591, 272)], SAGE, 6, 0.86)
    p.arrow([(410, 457), (482, 457), (482, 590), (591, 590)], BLUE, 4, 0.55)
    p.arrow([(789, 271), (918, 271), (918, 409), (1034, 409)], SAGE, 6, 0.86)
    p.arrow([(789, 590), (918, 590), (918, 457), (1034, 457)], BLUE, 4, 0.55)
    def card(points, color, check=False):
        x, y = points[0]
        p.wash((x + 102, y + 155), (124, 34), BLUE, 0.12)
        p.polygon(points, PAPER, 0.97)
        a, b, c, d = map(np.array, points)
        strip = [a + [0, 5], b + [0, 5], b * 0.79 + c * 0.21, a * 0.79 + d * 0.21]
        p.polygon(strip, color, 0.77, outline=False)
        if check:
            p.line([(x + 58, y + 113), (x + 93, y + 145), (x + 151, y + 80)],
                   SAGE, 11, 0.89, 1.2)
        else:
            p.line([(x + 36, y + 90), (x + 147, y + 92)], INK, 3, 0.47)
            p.line([(x + 37, y + 114), (x + 129, y + 116)], INK, 2, 0.33)
            p.line([(x + 37, y + 139), (x + 94, y + 139)], INK, 2, 0.25)
    card([(205, 323), (400, 311), (412, 511), (217, 523)], BLUE)
    card([(602, 164), (802, 177), (789, 378), (589, 365)], SAGE)
    card([(603, 494), (799, 488), (804, 682), (608, 688)], OCHRE)
    card([(1033, 318), (1246, 308), (1256, 517), (1043, 527)], SAGE, check=True)
    p.save("task-scheduling")


if __name__ == "__main__":
    for draw in (robotics, library, housing, scheduling, automation):
        draw()
