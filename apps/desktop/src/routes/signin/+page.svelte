<script lang="ts">
  import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";
  import { goto } from "$app/navigation";

  const { signIn } = useAuth();
  const isAuthenticated = $derived(useAuth().isAuthenticated);
  const isLoading = $derived(useAuth().isLoading);

  type Step =
    | "signIn"
    | "signUp"
    | { email: string; flow: "signUp-verification" };

  let step = $state<Step>("signIn");

  $effect(() => {
    if (isAuthenticated) {
      goto("/", { replaceState: true });
    }
  });
</script>

<div class="hero bg-base-200 min-h-screen">
  <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
    {#if typeof step === "object"}
      <form
        class="card-body"
        onsubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          signIn("password", formData);
          goto("/", { replaceState: true });
        }}
      >
        <h1 class="text-2xl font-bold">Enter Code</h1>
        <p class="text-base-content/70 text-sm">
          A code has been sent to <strong>{step.email}</strong>.
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
          <input name="email" value={step.email} type="hidden" />
        </div>
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary" disabled={isLoading}>
            {#if isLoading}<span class="loading loading-spinner"></span>{/if}
            Confirm & Sign Up
          </button>
        </div>
      </form>
    {:else}
      <form
        class="card-body"
        onsubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          if (step === "signUp") {
            if (formData.get("password") !== formData.get("confirmPassword")) {
              alert("Passwords do not match!");
              return;
            }
            signIn("password", formData).then(() => {
              step = {
                email: formData.get("email") as string,
                flow: "signUp-verification",
              };
            });
          } else {
            signIn("password", formData);
          }
        }}
      >
        <h1 class="text-2xl font-bold">
          {step === "signIn" ? "Sign In to Prism" : "Create an Account"}
        </h1>

        <button
          type="button"
          class="btn btn-outline mt-4 w-full"
          onclick={() => signIn("google")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 48 48"
            class="mr-2"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          Sign in with Google
        </button>

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
          <input name="flow" type="hidden" bind:value={step} />
          <button type="submit" class="btn btn-primary" disabled={isLoading}>
            {#if isLoading}<span class="loading loading-spinner"></span>{/if}
            {step === "signIn" ? "Sign In" : "Continue"}
          </button>
        </div>

        <div class="divider"></div>

        <div class="text-center">
          <button
            type="button"
            class="link-hover link"
            onclick={() => {
              step = step === "signIn" ? "signUp" : "signIn";
            }}
          >
            {step === "signIn"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
        {#if step === "signIn"}
          <div class="mt-4 text-center">
            <a href="/reset" class="link-hover link text-sm">Forgot password?</a
            >
          </div>
        {/if}
      </form>
    {/if}
  </div>
</div>
