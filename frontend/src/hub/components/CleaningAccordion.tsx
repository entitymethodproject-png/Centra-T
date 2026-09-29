import React from 'react';
import { ItemsAccordion, ItemsAccordionProps } from '../../items/components/ItemsAccordion';
import { CleaningItem } from '../../items/entities/item.entity';
import { CleaningService } from '../../items/services/items.service';

export interface CleaningAccordionProps extends Omit<ItemsAccordionProps, 'modulo'> {
  items?: CleaningItem[];
  cleaningService?: CleaningService;
}

export const CleaningAccordion: React.FC<CleaningAccordionProps> = (props) => {
  return <ItemsAccordion modulo="cleaning" title="Limpieza" {...props} />;
};
