import { CURRENCY } from "./constants";

export const formatMoney = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: CURRENCY }).format(
    Number(value ?? 0)
  );