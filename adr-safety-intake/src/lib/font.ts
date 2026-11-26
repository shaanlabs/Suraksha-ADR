import serifUrl from "../assets/SourceSerif4-Bold.ttf?url";

let pending: Promise<ArrayBuffer> | null = null;

export function loadSerifFont(): Promise<ArrayBuffer> {
  if (!pending) {
    pending = fetch(serifUrl).then((response) => {
      if (!response.ok) throw new Error("The report font could not be loaded.");
      return response.arrayBuffer();
    });
  }
  return pending;
}
