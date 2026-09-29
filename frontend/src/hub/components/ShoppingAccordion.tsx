import React from 'react';
import { ItemsAccordion, ItemsAccordionProps } from '../../items/components/ItemsAccordion';
import { ShoppingItem } from '../../items/entities/item.entity';
import { ShoppingService } from '../../items/services/items.service';

export interface ShoppingAccordionProps extends Omit<ItemsAccordionProps, 'modulo'> {
  items?: ShoppingItem[];
  shoppingService?: ShoppingService;
}

export const ShoppingAccordion: React.FC<ShoppingAccordionProps> = (props) => {
  return <ItemsAccordion modulo="shopping" title="Compra" {...props} />;
};
