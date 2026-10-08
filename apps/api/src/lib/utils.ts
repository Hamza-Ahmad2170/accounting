export const escapeLike = (val: string): string => {
  return val.replace(/[\\%_]/g, "\\$&");
};
