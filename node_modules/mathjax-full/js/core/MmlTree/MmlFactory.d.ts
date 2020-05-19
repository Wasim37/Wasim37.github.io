import { AbstractNodeFactory } from '../Tree/NodeFactory.js';
import { MmlNode, MmlNodeClass } from './MmlNode.js';
export declare class MmlFactory extends AbstractNodeFactory<MmlNode, MmlNodeClass> {
    static defaultNodes: {
        [kind: string]: MmlNodeClass;
    };
    get MML(): {
        [kind: string]: (...args: any[]) => MmlNode;
    };
}
