import { CheckType, BaseItem, StackItem } from '../StackItem.js';
import { MmlNode } from '../../../core/MmlTree/MmlNode.js';
export declare class BraketItem extends BaseItem {
    get kind(): string;
    get isOpen(): boolean;
    checkItem(item: StackItem): CheckType;
    toMml(): MmlNode;
}
