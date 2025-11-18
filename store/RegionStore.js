import { create } from "zustand";

const RegionStore = create((set) => ({
  region: "en",
  setRegion: (data) =>
    set((state) => ({
      region: data,
    })),
}));

export default RegionStore;
