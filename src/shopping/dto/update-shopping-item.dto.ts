export interface UpdateShoppingItemDto {
  nombre?: string;
  cantidad?: number;
  unidad?: string;
  comprado?: boolean;
  fechaProgramada?: Date | string | null;
}
