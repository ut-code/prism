<script lang="ts">
  const {
    onclick_reply,
    x,
    y,
    visible,
  }: { onclick_reply: () => void; x: number; y: number; visible: boolean } =
    $props();
</script>

<ul
  style={`top: ${y}px; left: ${x}px; visibility: ${visible ? "visible" : "hidden"}`}
  tabindex="0"
  role="menu"
  class="menu dropdown-content bg-base-100 absolute z-[1] w-40 rounded-md border p-2 shadow"
>
  <li>
    <button onclick={onclick_reply}>返信</button>
  </li>
</ul>
