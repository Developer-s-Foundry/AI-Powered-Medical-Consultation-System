// session.ts
export const session = {
  setToken: (t: string) => sessionStorage.setItem("hb_tok", t),
  getToken: (): string | null => sessionStorage.getItem("hb_tok"),
  clear: () => sessionStorage.clear(),
};
