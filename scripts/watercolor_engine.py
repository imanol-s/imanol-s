"""Shared paper, pigment and pencil primitives for the portfolio's watercolor covers.

Optional artwork tooling: python -m pip install numpy opencv-python-headless
Imported by generate-project-watercolors.py; fixed seeds keep every mark repeatable.
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
