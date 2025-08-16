<script lang="ts">
  import { Picker } from "emoji-picker-element";

  interface Props {
    onClose: () => void;
    onEmojiSelected: (emoji: string) => void;
    toggleButtonRef: HTMLElement | null;
  }
  let { onClose, onEmojiSelected, toggleButtonRef }: Props = $props();
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

    document.addEventListener("mousedown", handleClickOutside);

    const emojiPicker = document.querySelector("emoji-picker");
    if (emojiPicker) {
      emojiPicker.addEventListener("emoji-click", (event) => {
        const emoji = event.detail.unicode;
        if (!emoji) return;
        onEmojiSelected(emoji);
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (emojiPicker) {
        emojiPicker.removeEventListener("emoji-click", () => {});
      }
    };
  });
</script>

<div bind:this={paletteRef} class="absolute right-4 bottom-24"></div>
