export interface NumberPanelContext {
  readonly onDigit: (value: number) => void;
  readonly onErase: () => void;
}

export function renderNumberPanel(container: HTMLElement, ctx: NumberPanelContext): void {
  const panel = document.createElement("div");
  panel.setAttribute("data-testid", "number-panel");

  for (let value = 1; value <= 9; value++) {
    const button = document.createElement("button");
    button.textContent = String(value);
    button.setAttribute("data-digit", String(value));
    button.addEventListener("click", () => ctx.onDigit(value));
    panel.appendChild(button);
  }

  const eraseButton = document.createElement("button");
  eraseButton.textContent = "Borrar";
  eraseButton.setAttribute("data-action", "erase");
  eraseButton.addEventListener("click", () => ctx.onErase());
  panel.appendChild(eraseButton);

  container.appendChild(panel);
}
