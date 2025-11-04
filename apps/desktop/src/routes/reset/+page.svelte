<script lang="ts">
  import { useAuth } from "@mmailaender/convex-auth-svelte/sveltekit";

  const { signIn, isLoading } = useAuth();

  let step = $state<"forgot" | { email: string }>("forgot");
</script>

<div class="hero bg-base-200 min-h-screen">
  <div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
    {#if step === "forgot"}
      <form
        class="card-body"
        onsubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          void signIn("password", formData).then(
            () => (step = { email: formData.get("email") as string }),
          );
        }}
      >
        <h1 class="text-2xl font-bold">Reset Password</h1>
        <p class="text-base-content/70 text-sm">
          Enter your email address and we will send you a code to reset your
          password.
        </p>
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
          <input name="flow" type="hidden" value="reset" />
        </div>
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary" disabled={isLoading}>
            {#if isLoading}
              <span class="loading loading-spinner"></span>
            {/if}
            Send Code
          </button>
        </div>
      </form>
    {:else}
      <form
        class="card-body"
        onsubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          void signIn("password", formData);
        }}
      >
        <h1 class="text-2xl font-bold">Enter Code</h1>
        <p class="text-base-content/70 text-sm">
          A code has been sent to <strong>{step.email}</strong>.
        </p>
        <div class="form-control">
          <label class="label" for="code">
            <span class="label-text">Code</span>
          </label>
          <input
            id="code"
            name="code"
            placeholder="123456"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control">
          <label class="label" for="newPassword">
            <span class="label-text">New Password</span>
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="new password"
            class="input input-bordered"
            required
          />
          <input name="email" value={step.email} type="hidden" />
          <input name="flow" value="reset-verification" type="hidden" />
        </div>
        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary" disabled={isLoading}>
            {#if isLoading}
              <span class="loading loading-spinner"></span>
            {/if}
            Continue
          </button>
        </div>
        <div class="mt-4 text-center">
          <button
            type="button"
            class="link-hover link text-sm"
            onclick={() => (step = "forgot")}
          >
            Cancel
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
