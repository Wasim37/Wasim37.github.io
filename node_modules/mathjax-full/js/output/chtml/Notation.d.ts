import { CHTMLmenclose } from './Wrappers/menclose.js';
import * as Notation from '../common/Notation.js';
export * from '../common/Notation.js';
export declare const RenderElement: <N, T, D>(name: string, offset?: string) => Notation.Renderer<CHTMLmenclose<N, T, D>, N>;
export declare const Border: <N, T, D>(side: "left" | "right" | "bottom" | "top") => Notation.DefPair<CHTMLmenclose<N, T, D>, N>;
export declare const Border2: <N, T, D>(name: string, side1: "left" | "right" | "bottom" | "top", side2: "left" | "right" | "bottom" | "top") => Notation.DefPair<CHTMLmenclose<N, T, D>, N>;
export declare const DiagonalStrike: <N, T, D>(name: string, neg: number) => Notation.DefPair<CHTMLmenclose<N, T, D>, N>;
export declare const DiagonalArrow: <N, T, D>(name: string) => Notation.DefPair<CHTMLmenclose<N, T, D>, N>;
export declare const Arrow: <N, T, D>(name: string) => Notation.DefPair<CHTMLmenclose<N, T, D>, N>;
