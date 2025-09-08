<script lang="ts">
  import { Picker } from "emoji-picker-element";

  interface Props {
    onClose: () => void;
    onEmojiSelected: (emoji: string) => void;
    toggleButtonRef?: HTMLElement;
    x?: number;
    y?: number;
  }
  let { onClose, onEmojiSelected, toggleButtonRef, x, y }: Props = $props();
  let paletteRef: HTMLElement;

  $effect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        paletteRef &&
        !paletteRef.contains(event.target as Node) &&
        !toggleButtonRef?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const picker = new Picker();
    paletteRef.appendChild(picker);

    paletteRef.addEventListener("mousedown", (event: MouseEvent) => {
      event.stopPropagation();
    });

    document.addEventListener("mousedown", handleClickOutside);

    const emojiPicker = document.querySelector("emoji-picker");

    emojiPicker?.addEventListener("emoji-click", (event) => {
      const emoji = event.detail.unicode;
      if (!emoji) return;
      onEmojiSelected(emoji);
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (emojiPicker) {
        emojiPicker.removeEventListener("emoji-click", () => {});
      }
    };
  });
</script>

<div
  bind:this={paletteRef}
  class={x === undefined || y === undefined
    ? "absolute right-4 bottom-24"
    : "absolute"}
  style={`top: ${y}px; left: ${x}px;`}
></div>
