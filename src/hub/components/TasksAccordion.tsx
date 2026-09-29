import React from 'react';
import { ItemsAccordion, ItemsAccordionProps } from '../../items/components/ItemsAccordion';
import { TaskItem } from '../../items/entities/item.entity';
import { TasksService } from '../../items/services/items.service';

export interface TasksAccordionProps extends Omit<ItemsAccordionProps, 'modulo'> {
  tasks?: TaskItem[];
  tasksService?: TasksService;
}

export const TasksAccordion: React.FC<TasksAccordionProps> = (props) => {
  return <ItemsAccordion modulo="tasks" title="Tareas" {...props} />;
};
