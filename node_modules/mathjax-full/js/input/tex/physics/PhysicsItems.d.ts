import { CheckType, BaseItem, StackItem } from '../StackItem.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export declare class AutoOpen extends BaseItem {
    get kind(): string;
    get isOpen(): boolean;
    toMml(): MmlNode;
    checkItem(item: StackItem): CheckType;
}
