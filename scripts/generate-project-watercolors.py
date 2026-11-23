"""Draw the portfolio's original concept covers with OpenCV, without model output.

Optional artwork tooling: python -m pip install numpy opencv-python-headless
Run from any directory: python scripts/generate-project-watercolors.py
The fixed seeds make the paper grain, pigment blooms, and pencil marks repeatable.
These editorial illustrations describe project subjects, not measured results.
"""

import numpy as np

from watercolor_engine import (
    BLUE, CLAY, INK, OCHRE, PALE, PAPER, SAGE, Watercolor,
)

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


def data_dictionary():
    p = Watercolor(1226)
    p.background()
    p.wash((790, 650), (560, 46), BLUE, 0.13)
    # Three system screens label one field differently; their lines meet in one entry.
    screens = [((214, 196), CLAY), ((236, 350), OCHRE), ((214, 504), BLUE)]
    for (x, y), color in screens:
        p.wash((x + 98, y + 122), (104, 20), BLUE, 0.1)
        p.polygon([(x, y), (x + 186, y + 6), (x + 182, y + 112), (x - 3, y + 106)],
                  PAPER, 0.98)
        p.polygon([(x, y), (x + 186, y + 6), (x + 185, y + 31), (x - 1, y + 25)],
                  color, 0.8, outline=False)
        p.line([(x + 24, y + 62), (x + 92 + (y % 3) * 14, y + 64)], INK, 3, 0.5)
        p.line([(x + 24, y + 84), (x + 70, y + 85)], INK, 2, 0.28)
    joint = (532, 416)
    for start in [(404, 254), (424, 408), (400, 562)]:
        p.line(p.curve([start, ((start[0] + joint[0]) / 2, (start[1] * 2 + joint[1]) / 3),
                        joint]), SAGE, 4, 0.72)
    p.arrow([joint, (566, 416), (594, 418)], SAGE, 5, 0.8)
    # The dictionary entry: an index card whose values are partly withheld.
    p.wash((790, 642), (188, 30), BLUE, 0.14)
    p.polygon([(616, 196), (726, 192), (730, 230), (618, 234)], SAGE, 0.8)
    p.polygon([(612, 224), (962, 214), (972, 616), (620, 626)], PAPER, 0.98)
    p.polygon([(612, 224), (962, 214), (963, 262), (613, 271)], BLUE, 0.74,
              outline=False)
    p.line([(706, 270), (712, 620)], INK, 1, 0.3)
    for row, y in enumerate([306, 372, 438, 504, 568]):
        p.line([(638, y), (684, y - 1)], SAGE, 4, 0.7)
        if row in (1, 3):
            p.polygon([(734, y - 11), (896 - row * 12, y - 14), (897 - row * 12, y + 9),
                       (735, y + 12)], INK, 0.78, outline=False)
        else:
            p.line([(734, y), (874 - row * 18, y - 3)], BLUE, 3, 0.44)
        p.line([(630, y + 32), (950, y + 25)], INK, 1, 0.13)
    # Lineage leaves the entry as a small directed graph.
    p.arrow([(986, 418), (1030, 418), (1062, 420)], SAGE, 5, 0.8)
    nodes = {"field": ((1104, 420), SAGE, 34), "a": ((1236, 304), BLUE, 26),
             "b": ((1236, 540), BLUE, 26), "x": ((1360, 226), OCHRE, 20),
             "y": ((1374, 420), CLAY, 20), "z": ((1356, 612), OCHRE, 20)}
    for first, last in [("field", "a"), ("field", "b"), ("a", "x"), ("a", "y"),
                        ("b", "y"), ("b", "z")]:
        (x1, y1), (x2, y2) = nodes[first][0], nodes[last][0]
        p.line(p.curve([(x1, y1), ((x1 + x2) / 2, y1 * 0.35 + y2 * 0.65), (x2, y2)]),
               INK, 2, 0.42)
    for center, color, radius in nodes.values():
        p.wash((center[0] + 6, center[1] + radius + 10), (radius, 7), BLUE, 0.1)
        p.ellipse(center, (radius, radius), PAPER, 0.99, outline=False)
        p.ellipse(center, (radius, radius), color, 0.86)
    p.ellipse(nodes["field"][0], (13, 13), PAPER, 0.92)
    p.line([(250, 664), (1330, 664)], INK, 1, 0.14)
    p.save("data-dictionary")


if __name__ == "__main__":
    for draw in (robotics, library, housing, scheduling, automation, data_dictionary):
        draw()
