<script lang="ts">
  import GoogleButton from "./GoogleButton.svelte";

  interface Props {
    step: "signIn" | "signUp";
    isLoading: boolean;
    onSignIn: (provider: "google") => void;
    onSubmit: (formData: FormData) => void;
    onToggleMode: () => void;
  }

  const { step, isLoading, onSignIn, onSubmit, onToggleMode }: Props = $props();
</script>

<form
  class="card-body"
  onsubmit={(event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(formData);
  }}
>
  <h1 class="text-2xl font-bold">
    {step === "signIn" ? "Sign In to Prism" : "Create Account"}
  </h1>

  <GoogleButton onclick={() => onSignIn("google")} />

  <div class="divider">OR</div>

  <div class="form-control">
    <label class="label" for="email">
      <span class="label-text">Email</span>
    </label>
    <input
      id="email"
      name="email"
      placeholder="email"
      class="input input-bordered"
      required
    />
  </div>
  <div class="form-control">
    <label class="label" for="password">
      <span class="label-text">Password</span>
    </label>
    <input
      id="password"
      name="password"
      type="password"
      placeholder="password"
      class="input input-bordered"
      required
    />
  </div>
  {#if step === "signUp"}
    <div class="form-control">
      <label class="label" for="confirmPassword">
        <span class="label-text">Confirm Password</span>
      </label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        placeholder="confirm password"
        class="input input-bordered"
        required
      />
    </div>
  {/if}
  <div class="form-control mt-6">
    <input name="flow" type="hidden" value={step} />
    <button type="submit" class="btn btn-primary" disabled={isLoading}>
      {#if isLoading}<span class="loading loading-spinner"></span>{/if}
      {step === "signIn" ? "Sign In" : "Next"}
    </button>
  </div>

  <div class="divider"></div>

  <div class="text-center">
    <button type="button" class="link-hover link" onclick={onToggleMode}>
      {step === "signIn"
        ? "Don't have an account? Sign up"
        : "Already have an account? Sign in"}
    </button>
  </div>
</form>
