declare module 'cubejs' {
  export default class Cube {
    constructor(other?: any);
    identity(): Cube;
    init(other: any): void;
    toJSON(): any;
    asString(): string;
    move(alg: string): Cube;
    solve(maxDepth?: number): string;
    isSolved(): boolean;
    clone(): Cube;

    static initSolver(): void;
    static fromString(str: string): Cube;
    static random(): Cube;
    static scramble(): string;
    static inverse(alg: string): string;
  }
}
