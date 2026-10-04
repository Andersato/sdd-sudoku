import "./ui/styles.css";
import { mount } from "./ui/app";
import { defaultGeneratePuzzleAsync, type GeneratePuzzleAsync } from "./ui/generatePuzzleAsync";

declare global {
  interface Window {
    __sudokuTestGeneratePuzzle__?: GeneratePuzzleAsync;
  }
}

const container = document.getElementById("app");
if (container) {
  const generatePuzzleAsync = window.__sudokuTestGeneratePuzzle__ ?? defaultGeneratePuzzleAsync;
  mount(container, { generatePuzzleAsync });
}
