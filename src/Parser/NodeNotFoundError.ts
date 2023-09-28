export class NodeNotFoundError extends Error {
    constructor(index: number) {
        super(`Cannot parse node at index ${index}`);
    }

}
