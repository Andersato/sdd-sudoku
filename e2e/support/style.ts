import type { Locator, Page } from "@playwright/test";
import { contrastRatio, parseColor, type Rgba } from "../../src/ui/contrast";

export { contrastRatio, parseColor, type Rgba };

/** Valor calculado de una variable de la paleta, normalizado a rgb(). */
export async function paletteColor(page: Page, name: string): Promise<string> {
  return page.evaluate((variable) => {
    const probe = document.createElement("div");
    probe.style.color = `var(--color-${variable})`;
    document.body.appendChild(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);
}

export async function paletteRgba(page: Page, name: string): Promise<Rgba> {
  return parseColor(await paletteColor(page, name));
}

/** Propiedades calculadas de un elemento. */
export async function computed(locator: Locator, properties: readonly string[]): Promise<Record<string, string>> {
  return locator.evaluate((el, props) => {
    const style = getComputedStyle(el);
    return Object.fromEntries(props.map((p) => [p, style.getPropertyValue(p)]));
  }, properties);
}

/**
 * Primer fondo opaco subiendo por los ancestros del elemento (D8).
 * Falla si antes encuentra una imagen de fondo o un fondo translúcido.
 */
export async function effectiveBackground(locator: Locator): Promise<Rgba> {
  const chain = await locator.evaluate((el) => {
    const layers: { color: string; image: string; tag: string }[] = [];
    let node: Element | null = el;
    while (node) {
      const style = getComputedStyle(node);
      layers.push({ color: style.backgroundColor, image: style.backgroundImage, tag: node.tagName });
      node = node.parentElement;
    }
    return layers;
  });

  for (const layer of chain) {
    if (layer.image !== "none") {
      throw new Error(`Fondo con imagen o degradado en <${layer.tag}>: ${layer.image}`);
    }
    const color = parseColor(layer.color);
    if (color.a === 1) {
      return color;
    }
    if (color.a > 0) {
      throw new Error(`Fondo translúcido en <${layer.tag}>: ${layer.color}`);
    }
  }
  throw new Error("No hay ningún fondo opaco detrás del elemento");
}

/** Contraste entre el color del texto del elemento y su fondo efectivo. */
export async function textContrast(locator: Locator): Promise<number> {
  const { color } = await computed(locator, ["color"]);
  return contrastRatio(parseColor(color), await effectiveBackground(locator));
}

export async function expectReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

export function sameRgb(a: Rgba, b: Rgba): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

/** ¿Aparecen los canales del color dentro de un valor como box-shadow? */
export function containsRgb(value: string, color: Rgba): boolean {
  return [...value.matchAll(/rgba?\([^)]*\)/g)].some((m) => sameRgb(parseColor(m[0]), color));
}

/**
 * Recorre con la tecla Tab todos los botones habilitados de la pantalla y llama a
 * `visit` con el botón que tiene el foco del teclado. Comprueba que el foco es de
 * teclado de verdad (`:focus-visible`) y que se visitan todos los botones.
 */
export async function tabThroughButtons(
  page: Page,
  visit: (focused: Locator, index: number) => Promise<void>,
): Promise<void> {
  const total = await page.locator("button:not(:disabled)").count();
  const visited = new Set<number>();
  for (let step = 0; step < total * 3 + 5 && visited.size < total; step++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button:not(:disabled)"));
      const active = document.activeElement;
      const index = buttons.indexOf(active as Element);
      return { index, focusVisible: index >= 0 && (active as Element).matches(":focus-visible") };
    });
    if (info.index < 0 || visited.has(info.index)) {
      continue;
    }
    if (!info.focusVisible) {
      throw new Error(`El botón ${info.index} tiene el foco tras Tab pero no :focus-visible`);
    }
    visited.add(info.index);
    await visit(page.locator(":focus"), info.index);
  }
  if (visited.size !== total) {
    throw new Error(`Con Tab solo se visitaron ${visited.size} de ${total} botones`);
  }
}

/** Duraciones de una lista como "0.15s, 0.15s" en segundos. */
export function durations(value: string): number[] {
  return value.split(",").map((part) => {
    const v = part.trim();
    return v.endsWith("ms") ? parseFloat(v) / 1000 : parseFloat(v);
  });
}
