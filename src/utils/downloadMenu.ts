export const downloadMenu = () => {
  const base = import.meta.env.BASE_URL || '/';
  const a = document.createElement('a');
  a.href = `${base}PP-Menu.pdf`;
  a.download = 'Perfect-Perfections-Menu.pdf';
  a.click();
};
