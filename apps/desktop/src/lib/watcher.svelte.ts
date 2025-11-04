import { tick } from "svelte";

export class Watcher<T> {
  onupdate?: (value: T) => void;
  set: (value: T) => void;

  constructor(
    private getter: () => T,
    private setter: (value: T) => void,
  ) {
    let isInternalWriterWriting = false;

    // runs on External Writer as well as Internal Update event
    $effect(() => {
      const value = this.getter();
      // only allow `onupdate` to be called on External Writer event
      if (isInternalWriterWriting) return;

      this.onupdate?.(value);
    });

    this.set = (value: T) => {
      isInternalWriterWriting = true;
      this.setter(value);
      // `$effect` delays execution until next tick, so we cannot simply reset `isInternalWriterWriting` in the same tick
      tick().then(() => {
        isInternalWriterWriting = false;
      });
    };
  }
}
