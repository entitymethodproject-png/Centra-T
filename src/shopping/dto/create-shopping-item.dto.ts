export interface CreateShoppingItemDto {
  nombre: string;
  cantidad?: number;
  unidad?: string;
  fechaProgramada?: Date | string | null;
}
