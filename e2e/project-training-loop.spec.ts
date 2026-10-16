import { expect, test } from "@playwright/test";

const cases: { width: number; textSize: number; diagramWidth?: number }[] = [
  ...[320, 390, 596, 768, 1440].flatMap((width) =>
    [100, 200].map((textSize) => ({ width, textSize })),
  ),
  { width: 768, textSize: 100, diagramWidth: 399 },
  { width: 768, textSize: 100, diagramWidth: 401 },
];

for (const { width, textSize, diagramWidth } of cases) {
  test(`training connectors meet the boxes at ${width}px with ${textSize}% text${diagramWidth ? ` in a ${diagramWidth}px container` : ""}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects/sensori-robotics");
    if (textSize !== 100)
      await page.addStyleTag({
        content: `html { font-size: ${textSize}% !important; }`,
      });
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator(".training-loop");
    if (diagramWidth)
      await figure.evaluate((root, value) => {
        (root as HTMLElement).style.width = `${value}px`;
      }, diagramWidth);
    await expect(figure.locator(".loop-forward line")).toHaveCount(4);
    await figure.scrollIntoViewIfNeeded();
    const geometry = await figure.evaluate(async (root) => {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const box = (node: Element) => {
        const b = node.getBoundingClientRect();
        return {
          left: b.left,
          right: b.right,
          top: b.top,
          bottom: b.bottom,
          cx: b.left + b.width / 2,
          cy: b.top + b.height / 2,
        };
      };
      const endpoints = (line: SVGLineElement) => {
        const matrix = line.getScreenCTM()!;
        const start = new DOMPoint(
          line.x1.baseVal.value,
          line.y1.baseVal.value,
        ).matrixTransform(matrix);
        const end = new DOMPoint(
          line.x2.baseVal.value,
          line.y2.baseVal.value,
        ).matrixTransform(matrix);
        return {
          start: { x: start.x, y: start.y },
          end: { x: end.x, y: end.y },
          marker: line.getAttribute("marker-end"),
          stroke: getComputedStyle(line).strokeWidth,
        };
      };
      const boxes = [...root.querySelectorAll(".loop-steps > li")].map(box);
      const horizontal = Math.abs(boxes[0].cy - boxes[1].cy) < 0.25;
      const returnSvg = root.querySelector<SVGSVGElement>(
        horizontal ? ".loop-return-horizontal" : ".loop-return-vertical",
      )!;
      const marker = root.querySelector("marker")!;
      const tip = marker.querySelector("path")!;
      const middle = tip.getPointAtLength(tip.getTotalLength() / 2);
      const connectorSvgs = [
        ...root.querySelectorAll<SVGSVGElement>(".loop-forward"),
        returnSvg,
      ];
      return {
        boxes,
        horizontal,
        bounds: box(root),
        forward: [
          ...root.querySelectorAll<SVGLineElement>(".loop-forward line"),
        ].map(endpoints),
        back: [...returnSvg.querySelectorAll<SVGLineElement>("line")].map(
          endpoints,
        ),
        marker: {
          id: marker.id,
          units: marker.getAttribute("markerUnits"),
          orient: marker.getAttribute("orient"),
          refX: marker.getAttribute("refX"),
          refY: marker.getAttribute("refY"),
          tip: { x: middle.x, y: middle.y },
        },
        visible: connectorSvgs.every((svg) => {
          const b = svg.getBoundingClientRect();
          const style = getComputedStyle(svg);
          return (
            b.width > 0 &&
            b.height > 0 &&
            style.display !== "none" &&
            style.visibility === "visible" &&
            style.overflow === "visible"
          );
        }),
        diagramWidth: root.getBoundingClientRect().width,
        rootFont: parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        ),
      };
    });
    const near = (actual: number, expected: number, label: string) =>
      expect(Math.abs(actual - expected), label).toBeLessThanOrEqual(0.25);
    const point = (
      actual: { x: number; y: number },
      x: number,
      y: number,
      label: string,
    ) => {
      near(actual.x, x, `${label} x`);
      near(actual.y, y, `${label} y`);
    };
    expect(geometry.boxes).toHaveLength(5);
    expect(geometry.visible).toBe(true);
    if (textSize === 100 && [320, 390].includes(width))
      expect(geometry.horizontal).toBe(false);
    if (textSize === 100 && [596, 768, 1440].includes(width) && !diagramWidth)
      expect(geometry.horizontal).toBe(true);
    if (diagramWidth === 399) {
      expect(geometry.diagramWidth).toBeLessThanOrEqual(400);
      expect(geometry.horizontal).toBe(false);
    }
    if (diagramWidth === 401) {
      expect(geometry.diagramWidth).toBeGreaterThan(400);
      expect(geometry.horizontal).toBe(true);
    }
    near(geometry.rootFont, textSize === 200 ? 32 : 16, "root text size");
    for (let index = 0; index < 4; index++) {
      const from = geometry.boxes[index];
      const to = geometry.boxes[index + 1];
      const arrow = geometry.forward[index];
      if (geometry.horizontal) {
        point(arrow.start, from.right, from.cy, `forward ${index + 1} source`);
        point(arrow.end, to.left, to.cy, `forward ${index + 1} target`);
      } else {
        point(arrow.start, from.cx, from.bottom, `forward ${index + 1} source`);
        point(arrow.end, to.cx, to.top, `forward ${index + 1} target`);
      }
    }
    expect(geometry.back).toHaveLength(3);
    const first = geometry.boxes[0];
    const last = geometry.boxes[4];
    const [start, cross, finish] = geometry.back;
    if (geometry.horizontal) {
      point(start.start, last.cx, last.bottom, "return source");
      point(finish.end, first.cx, first.bottom, "return tip");
    } else {
      point(start.start, last.left, last.cy, "return source");
      point(finish.end, first.left, first.cy, "return tip");
      for (const b of geometry.boxes)
        near(b.bottom - b.top, first.bottom - first.top, "equal stacked rows");
    }
    point(start.end, cross.start.x, cross.start.y, "first return join");
    point(cross.end, finish.start.x, finish.start.y, "second return join");
    expect(geometry.marker.units).toBe("userSpaceOnUse");
    expect(geometry.marker.orient).toBe("auto");
    expect(Number(geometry.marker.refX)).toBe(0);
    expect(Number(geometry.marker.refY)).toBe(0);
    point(geometry.marker.tip, 0, 0, "arrowhead tip at marker reference");
    for (const arrow of [...geometry.forward, finish])
      expect(arrow.marker).toBe(`url(#${geometry.marker.id})`);
    for (const segment of [...geometry.forward, ...geometry.back]) {
      expect(parseFloat(segment.stroke)).toBe(2);
      for (const p of [segment.start, segment.end]) {
        expect(p.x).toBeGreaterThanOrEqual(geometry.bounds.left - 0.25);
        expect(p.x).toBeLessThanOrEqual(geometry.bounds.right + 0.25);
        expect(p.y).toBeGreaterThanOrEqual(geometry.bounds.top - 0.25);
        expect(p.y).toBeLessThanOrEqual(geometry.bounds.bottom + 0.25);
      }
    }
  });
}
