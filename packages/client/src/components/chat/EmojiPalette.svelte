<script lang="ts">
  import { Picker } from "emoji-picker-element";

  interface Props {
    onClose: () => void;
    onEmojiSelected: (emoji: string) => void;
    x?: number;
    y?: number;
  }
  let { onClose, onEmojiSelected, x, y }: Props = $props();
  let paletteRef: HTMLElement;

  const paletteWidth = 350; // emoji-picker-element default width
  const paletteHeight = 450; // emoji-picker-element default height

  let finalX = $state(x);
  let finalY = $state(y);

  $effect(() => {
    if (x !== undefined && y !== undefined) {
      finalX = x + paletteWidth > window.innerWidth ? x - paletteWidth : x;
      finalY = y + paletteHeight > window.innerHeight ? y - paletteHeight : y;
    }
  });

  $effect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        paletteRef &&
        !paletteRef.contains(event.target as Node)
        // !toggleButtonRef?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const picker = new Picker();
    paletteRef.appendChild(picker);

    paletteRef.addEventListener("click", (event: MouseEvent) => {
      event.stopPropagation();
    });

    document.addEventListener("click", handleClickOutside);

    const emojiPicker = document.querySelector("emoji-picker");

    emojiPicker?.addEventListener("emoji-click", (event) => {
      const emoji = event.detail.unicode;
      if (!emoji) return;
      onEmojiSelected(emoji);
    });

    return () => {
      document.removeEventListener("click", handleClickOutside);
      if (emojiPicker) {
        emojiPicker.removeEventListener("emoji-click", () => {});
      }
    };
  });
</script>

<div
  bind:this={paletteRef}
  class={`z-10 ${
    x === undefined || y === undefined
      ? "absolute right-4 bottom-24"
      : "absolute"
  }`}
  style={`top: ${finalY}px; left: ${finalX}px;`}
></div>
