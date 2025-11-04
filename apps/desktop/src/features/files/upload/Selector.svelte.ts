import type { Id } from "@apps/convex";

export interface SelectorProps {
  organizationId: Id<"organizations">;
  onselect: (files: File[]) => void;
  multiple?: boolean;
}

export class SelectorController {
  organizationId = $derived.by(() => this.props().organizationId);
  multiple = $derived.by(() => this.props().multiple ?? true);
  onselect = $derived.by(() => this.props().onselect);
  fileInput = $state<HTMLInputElement | undefined>();

  isDragOver = $state(false); // what is this used for?

  constructor(private props: () => SelectorProps) {}
  handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    this.isDragOver = true;
  };

  handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    this.isDragOver = false;
  };

  handleDrop = (event: DragEvent) => {
    event.preventDefault();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.onselect(files);
  };

  handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length > 0) {
      this.onselect(files);
    }
    input.value = "";
  };

  handleClick = () => {
    this.fileInput?.click();
  };
}
