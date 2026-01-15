<script lang="ts">
  interface Props {
    email: string;
    isLoading: boolean;
    onSubmit: (code: string) => void;
  }

  const { email, isLoading, onSubmit }: Props = $props();
</script>

<form
  class="card-body"
  onsubmit={(event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "");
    onSubmit(code);
  }}
>
  <h1 class="text-2xl font-bold">Enter Verification Code</h1>
  <p class="text-base-content/70 text-sm">
    We sent a verification code to <strong>{email}</strong>
  </p>
  <div class="form-control">
    <label class="label" for="code">
      <span class="label-text">Verification Code</span>
    </label>
    <input
      id="code"
      name="code"
      placeholder="123456"
      class="input input-bordered"
      required
    />
    <input name="flow" type="hidden" value="email-verification" />
    <input name="email" value={email} type="hidden" />
  </div>
  <div class="form-control mt-6">
    <button type="submit" class="btn btn-primary" disabled={isLoading}>
      {#if isLoading}<span class="loading loading-spinner"></span>{/if}
      Verify and Sign Up
    </button>
  </div>
</form>
